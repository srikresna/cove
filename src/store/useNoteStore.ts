import { create } from "zustand";
import { MESSAGES } from "../constants/messages";
import { blockSuiteEditorService, noteService, vaultService } from "../di/container";
import type { Note } from "../domain/note/Note";
import { presentError } from "../services/errorPresenter";
import { processCoverImage } from "../utils/coverImage";
import { useNotificationStore } from "./useNotificationStore";
import { useSaveStatusStore } from "./useSaveStatusStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

interface NoteState {
  notes: Note[];
  trashedNotes: Note[];
  activeNoteId: string | null;
  activeCoverImage: string | null;
  setActiveNoteId: (id: string | null) => void;
  fetchNotes: (workspaceId: string) => Promise<void>;
  fetchTrash: () => Promise<void>;
  loadActiveNoteContent: (id: string) => Promise<void>;
  createNote: (
    workspaceId: string,
    title?: string,
    content?: string,
    icon?: string,
  ) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  uploadCoverImage: (id: string, file: File) => Promise<void>;
  removeCoverImage: (id: string) => Promise<void>;
  moveNoteToWorkspace: (id: string, workspaceId: string) => Promise<void>;
  trashNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  deleteNotePermanently: (id: string) => Promise<void>;
  purgeExpiredTrash: () => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;
  toggleFavoriteNote: (id: string) => Promise<void>;
}

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
    trashedNotes: [],
    activeNoteId: null,
    activeCoverImage: null,

    setActiveNoteId: (id) => set({ activeNoteId: id, activeCoverImage: null }),

    fetchNotes: async (workspaceId) => {
      try {
        const notes = await noteService.listMetadataByWorkspace(workspaceId);

        blockSuiteEditorService.registerExistingNotes(
          notes.map((n) => ({ id: n.id, title: n.title })),
        );
        const first = notes[0];
        set({ notes, activeNoteId: first ? first.id : null, activeCoverImage: null });
      } catch (err) {
        notifyError(err, { saveStatus: false });
      }
    },

    fetchTrash: async () => {
      try {
        set({ trashedNotes: await noteService.listTrash() });
      } catch (err) {
        notifyError(err, { saveStatus: false });
      }
    },

    loadActiveNoteContent: async (id) => {
      try {
        const [note, cover] = await Promise.all([
          noteService.getNote(id),
          noteService.getCoverImage(id),
        ]);

        if (get().activeNoteId !== id) return;
        set((state) => ({
          notes: note ? state.notes.map((n) => (n.id === id ? note : n)) : state.notes,
          activeCoverImage: cover,
        }));
      } catch (err) {
        notifyError(err, { saveStatus: false });
      }
    },

    createNote: async (workspaceId, title, content, icon) => {
      useSaveStatusStore.getState().setSaving();
      try {
        const created = await noteService.createNote(workspaceId, title, content, icon);

        blockSuiteEditorService.registerExistingNotes([{ id: created.id, title: created.title }]);
        set((state) => ({
          notes: [created, ...state.notes],
          activeNoteId: created.id,
          activeCoverImage: null,
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
        const { content, ...metadata } = updates;
        if (content !== undefined) {
          await noteService.updateContent(id, content);
        }
        if (Object.keys(metadata).length > 0) {
          await noteService.updateMetadata(id, metadata);
        }
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        set({ notes: previousNotes });
        notifyError(err);
      }
    },

    uploadCoverImage: async (id, file) => {
      useSaveStatusStore.getState().setSaving();
      try {
        const dataUrl = await processCoverImage(file);
        await noteService.setCoverImage(id, dataUrl);
        if (get().activeNoteId === id) {
          set({ activeCoverImage: dataUrl });
        }
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        notifyError(err);
      }
    },

    removeCoverImage: async (id) => {
      const previous = get().activeCoverImage;
      if (get().activeNoteId === id) {
        set({ activeCoverImage: null });
      }
      useSaveStatusStore.getState().setSaving();
      try {
        await noteService.removeCoverImage(id);
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        if (get().activeNoteId === id) {
          set({ activeCoverImage: previous });
        }
        notifyError(err);
      }
    },

    moveNoteToWorkspace: async (id, workspaceId) => {
      useSaveStatusStore.getState().setSaving();
      try {
        await noteService.updateMetadata(id, { workspaceId });
        useWorkspaceStore.getState().setActiveWorkspace(workspaceId);
        await get().fetchNotes(workspaceId);
        set({ activeNoteId: id });
        await get().loadActiveNoteContent(id);
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        notifyError(err);
      }
    },

    trashNote: async (id) => {
      const previousNotes = get().notes;
      const previousActive = get().activeNoteId;
      const filtered = previousNotes.filter((n) => n.id !== id);
      const wasActive = previousActive === id;

      set({
        notes: filtered,
        activeNoteId: wasActive ? (filtered[0]?.id ?? null) : previousActive,
        ...(wasActive ? { activeCoverImage: null } : {}),
      });
      useSaveStatusStore.getState().setSaving();

      try {
        await noteService.trashNote(id);
        useSaveStatusStore.getState().setSaved();
        useNotificationStore.getState().pushToast({
          kind: "info",
          title: MESSAGES.TRASH_MOVED_TOAST,
          description: MESSAGES.TRASH_MOVED_DESC,
        });
      } catch (err) {
        set({ notes: previousNotes, activeNoteId: previousActive });
        notifyError(err);
      }
    },

    restoreNote: async (id) => {
      const trashed = get().trashedNotes.find((n) => n.id === id);
      set((state) => ({ trashedNotes: state.trashedNotes.filter((n) => n.id !== id) }));

      try {
        await noteService.restoreNote(id);
        const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
        if (trashed && trashed.workspaceId === activeWorkspaceId) {
          const notes = await noteService.listMetadataByWorkspace(activeWorkspaceId);
          set({ notes });
        }
      } catch (err) {
        if (trashed) {
          set((state) => ({ trashedNotes: [trashed, ...state.trashedNotes] }));
        }
        notifyError(err, { saveStatus: false });
      }
    },

    deleteNotePermanently: async (id) => {
      const previousTrash = get().trashedNotes;
      set((state) => ({ trashedNotes: state.trashedNotes.filter((n) => n.id !== id) }));

      try {
        await noteService.deleteNote(id);
      } catch (err) {
        set({ trashedNotes: previousTrash });
        notifyError(err, { saveStatus: false });
      }
    },

    purgeExpiredTrash: async () => {
      try {
        await noteService.purgeExpiredTrash();
      } catch (err) {
        notifyError(err, { saveStatus: false });
      }
    },

    duplicateNote: async (id) => {
      useSaveStatusStore.getState().setSaving();
      try {
        const duplicated = await noteService.duplicateNote(id);
        set((state) => ({
          notes: [duplicated, ...state.notes],
          activeNoteId: duplicated.id,
          activeCoverImage: null,
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

vaultService.onLock(() => {
  useNoteStore.setState({ notes: [], activeNoteId: null, activeCoverImage: null });
});

blockSuiteEditorService.provideDocCreatedHandler(async (docId, title) => {
  const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
  if (!activeWs) return;
  await noteService.createNoteWithId(activeWs, docId, title);
  await useNoteStore.getState().fetchNotes(activeWs);
});
