import { create } from "zustand";
import { noteService } from "../di/container";
import type { Note } from "../domain/note/Note";

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  setActiveNoteId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  fetchNotes: (workspaceId: string) => Promise<void>;
  createNote: (
    workspaceId: string,
    title?: string,
    content?: string,
    icon?: string,
  ) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  toggleFavoriteNote: (id: string) => Promise<void>;
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

  setActiveNoteId: (id) => set({ activeNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchNotes: async (workspaceId) => {
    try {
      const notes = await noteService.listMetadataByWorkspace(workspaceId);
      if (notes.length > 0) {
        set({ notes, activeNoteId: notes[0].id });
      } else {
        set({ notes: get().notes.filter((n) => n.workspaceId === workspaceId) });
      }
    } catch (err) {
      console.error("fetchNotes store error:", err);
    }
  },

  createNote: async (workspaceId, title, content, icon) => {
    const previousNotes = get().notes;
    try {
      const created = await noteService.createNote(workspaceId, title, content, icon);
      set((state) => ({
        notes: [created, ...state.notes],
        activeNoteId: created.id,
      }));
      return created;
    } catch (err) {
      console.error("createNote store error:", err);
      set({ notes: previousNotes });
      return null;
    }
  },

  updateNote: async (id, updates) => {
    const previousNotes = get().notes;
    const now = Date.now();
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n)),
    }));

    try {
      if (updates.content !== undefined) {
        await noteService.updateContent(id, updates.content);
      } else {
        await noteService.updateMetadata(id, updates);
      }
    } catch (err) {
      console.error("updateNote store error, rolling back:", err);
      set({ notes: previousNotes });
    }
  },

  deleteNote: async (id) => {
    const previousNotes = get().notes;
    const previousActive = get().activeNoteId;
    const filtered = previousNotes.filter((n) => n.id !== id);
    const nextActive = filtered[0]?.id || null;

    set({ notes: filtered, activeNoteId: nextActive });

    try {
      await noteService.deleteNote(id);
    } catch (err) {
      console.error("deleteNote store error, rolling back:", err);
      set({ notes: previousNotes, activeNoteId: previousActive });
    }
  },

  duplicateNote: async (id) => {
    const previousNotes = get().notes;
    try {
      const duplicated = await noteService.duplicateNote(id);
      set((state) => ({
        notes: [duplicated, ...state.notes],
        activeNoteId: duplicated.id,
      }));
    } catch (err) {
      console.error("duplicateNote store error:", err);
      set({ notes: previousNotes });
    }
  },

  togglePinNote: async (id) => {
    const previousNotes = get().notes;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    }));

    try {
      await noteService.togglePin(id);
    } catch (err) {
      console.error("togglePinNote store error:", err);
      set({ notes: previousNotes });
    }
  },

  toggleFavoriteNote: async (id) => {
    const previousNotes = get().notes;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n)),
    }));

    try {
      await noteService.toggleFavorite(id);
    } catch (err) {
      console.error("toggleFavoriteNote store error:", err);
      set({ notes: previousNotes });
    }
  },
}));
