import { create } from "zustand";
import { noteService, vaultService } from "../di/container";
import type { Note } from "../domain/note/Note";
import { presentError } from "../services/errorPresenter";
import { useNotificationStore } from "./useNotificationStore";
import { useSaveStatusStore } from "./useSaveStatusStore";

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  fetchNotes: (workspaceId: string) => Promise<void>;
  loadActiveNoteContent: (id: string) => Promise<void>;
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

/** Single error-presentation path: toast always, save-status only for save-flow ops. */
function notifyError(err: unknown, opts: { saveStatus: boolean } = { saveStatus: true }): void {
  const p = presentError(err);
  if (opts.saveStatus) {
    useSaveStatusStore.getState().setError(p.userMessage);
  }
  useNotificationStore.getState().pushToast({
    kind: p.kind,
    title: p.toastTitle,
    description: p.toastDescription,
  });
}

export const useNoteStore = create<NoteState>((set, get) => {
  /** Shared optimistic toggle for boolean note flags. */
  const toggleFlag = async (id: string, key: "isPinned" | "isFavorite"): Promise<void> => {
    const previousNotes = get().notes;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, [key]: !n[key] } : n)),
    }));
    useSaveStatusStore.getState().setSaving();

    try {
      if (key === "isPinned") {
        await noteService.togglePin(id);
      } else {
        await noteService.toggleFavorite(id);
      }
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      set({ notes: previousNotes });
      notifyError(err);
    }
  };

  return {
    notes: [],
    activeNoteId: null,

    setActiveNoteId: (id) => set({ activeNoteId: id }),

    fetchNotes: async (workspaceId) => {
      try {
        const notes = await noteService.listMetadataByWorkspace(workspaceId);
        const first = notes[0];
        set({ notes, activeNoteId: first ? first.id : null });
      } catch (err) {
        notifyError(err, { saveStatus: false });
      }
    },

    loadActiveNoteContent: async (id) => {
      try {
        const note = await noteService.getNote(id);
        if (note) {
          set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? note : n)),
          }));
        }
      } catch (err) {
        notifyError(err, { saveStatus: false });
      }
    },

    createNote: async (workspaceId, title, content, icon) => {
      useSaveStatusStore.getState().setSaving();
      try {
        const created = await noteService.createNote(workspaceId, title, content, icon);
        set((state) => ({
          notes: [created, ...state.notes],
          activeNoteId: created.id,
        }));
        useSaveStatusStore.getState().setSaved();
        return created;
      } catch (err) {
        notifyError(err);
        return null;
      }
    },

    updateNote: async (id, updates) => {
      const previousNotes = get().notes;
      const now = Date.now();
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n)),
      }));
      useSaveStatusStore.getState().setSaving();

      try {
        if (updates.content !== undefined) {
          await noteService.updateContent(id, updates.content);
        } else {
          await noteService.updateMetadata(id, updates);
        }
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        set({ notes: previousNotes });
        notifyError(err);
      }
    },

    deleteNote: async (id) => {
      const previousNotes = get().notes;
      const previousActive = get().activeNoteId;
      const filtered = previousNotes.filter((n) => n.id !== id);
      const nextActive = filtered[0]?.id || null;

      set({ notes: filtered, activeNoteId: nextActive });
      useSaveStatusStore.getState().setSaving();

      try {
        await noteService.deleteNote(id);
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        set({ notes: previousNotes, activeNoteId: previousActive });
        notifyError(err);
      }
    },

    duplicateNote: async (id) => {
      useSaveStatusStore.getState().setSaving();
      try {
        const duplicated = await noteService.duplicateNote(id);
        set((state) => ({
          notes: [duplicated, ...state.notes],
          activeNoteId: duplicated.id,
        }));
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        notifyError(err);
      }
    },

    togglePinNote: (id) => toggleFlag(id, "isPinned"),
    toggleFavoriteNote: (id) => toggleFlag(id, "isFavorite"),
  };
});

// H1 fix: purge decrypted note content from memory on EVERY lock, no matter
// who initiated it (settings button, idle timer, beforeunload, future callers
// of vaultService.lock()). Registered against the service so the invariant
// cannot be bypassed by skipping the vault store.
vaultService.onLock(() => {
  useNoteStore.setState({ notes: [], activeNoteId: null });
});
