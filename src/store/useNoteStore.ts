import { create } from "zustand";
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import type { Note } from "../types";

const noteRepository = new SQLiteNoteRepository();

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  isLoading: boolean;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  fetchNotes: (workspaceId: string) => Promise<void>;
  createNote: (
    workspaceId: string,
    title?: string,
    content?: string,
    icon?: string,
  ) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  toggleFavoriteNote: (id: string) => Promise<void>;
  deleteNotesByWorkspace: (workspaceId: string) => Promise<void>;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: "default-note-1",
    workspaceId: "default-workspace-1",
    title: "Joyful UI Ideas & Brainstorming",
    content:
      '[{"type":"paragraph","content":[{"type":"text","text":"Welcome to your brand new block editor in Cove Notes!"}]}]',
    icon: "🎨",
    coverColor: "#ff6f1e",
    isPinned: true,
    isFavorite: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: DEFAULT_NOTES,
  activeNoteId: "default-note-1",
  searchQuery: "",
  isLoading: false,

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchNotes: async (workspaceId) => {
    set({ isLoading: true });
    try {
      const notes = await noteRepository.getNotesByWorkspace(workspaceId);
      if (notes.length > 0) {
        set({ notes, activeNoteId: notes[0].id, isLoading: false });
      } else {
        set({ notes: get().notes.filter((n) => n.workspaceId === workspaceId), isLoading: false });
      }
    } catch (err) {
      console.error("fetchNotes store error:", err);
      set({ isLoading: false });
    }
  },

  createNote: async (
    workspaceId,
    title = "Untitled Note",
    content = '[{"type":"paragraph","content":[]}]',
    icon = "📝",
  ) => {
    const newNoteInput: Omit<Note, "createdAt" | "updatedAt"> = {
      id: crypto.randomUUID(),
      workspaceId,
      title,
      content,
      icon,
      coverColor: "#ff6f1e",
      isPinned: false,
      isFavorite: false,
    };

    set((state) => ({
      notes: [{ ...newNoteInput, createdAt: Date.now(), updatedAt: Date.now() }, ...state.notes],
      activeNoteId: newNoteInput.id,
    }));

    try {
      const created = await noteRepository.createNote(newNoteInput);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === created.id ? created : n)),
      }));
      return created;
    } catch (err) {
      console.error("createNote store error:", err);
      return { ...newNoteInput, createdAt: Date.now(), updatedAt: Date.now() };
    }
  },

  updateNote: async (id, updates) => {
    const now = Date.now();
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n)),
    }));

    try {
      await noteRepository.updateNote(id, updates);
    } catch (err) {
      console.error("updateNote store error:", err);
    }
  },

  deleteNote: async (id) => {
    const currentNotes = get().notes;
    const filtered = currentNotes.filter((n) => n.id !== id);
    const nextActive = filtered[0]?.id || null;

    set({ notes: filtered, activeNoteId: nextActive });

    try {
      await noteRepository.deleteNote(id);
    } catch (err) {
      console.error("deleteNote store error:", err);
    }
  },

  duplicateNote: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;

    await get().createNote(note.workspaceId, `${note.title} (Copy)`, note.content, note.icon);
  },

  togglePinNote: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    await get().updateNote(id, { isPinned: !note.isPinned });
  },

  toggleFavoriteNote: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    await get().updateNote(id, { isFavorite: !note.isFavorite });
  },

  deleteNotesByWorkspace: async (workspaceId) => {
    const remainingNotes = get().notes.filter((n) => n.workspaceId !== workspaceId);
    set({ notes: remainingNotes, activeNoteId: remainingNotes[0]?.id || null });
  },
}));
