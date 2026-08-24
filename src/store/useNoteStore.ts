import { create } from "zustand";
import { MESSAGES } from "../constants/messages";
import { blockSuiteEditorService, noteService, vaultService } from "../di/container";
import type { Note } from "../domain/note/Note";
import { clearBacklinkScans, invalidateNoteBacklinkScan } from "../services/editor/backlinkScan";
import { processCoverImage } from "../utils/coverImage";
import { notifyErrorWithSaveStatus as notifyError } from "./notify";
import { useNotificationStore } from "./useNotificationStore";
import { useSaveStatusStore } from "./useSaveStatusStore";
import { useUIStore } from "./useUIStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

interface NoteState {
  notes: Note[];
  trashedNotes: Note[];
  activeNoteId: string | null;
  activeCoverImage: string | null;
  setActiveNoteId: (id: string | null) => void;
  fetchNotes: (workspaceId: string) => Promise<void>;

  refreshNotesInPlace: (workspaceId: string) => Promise<void>;
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

export const useNoteStore = create<NoteState>((set, get) => {
  const toggleFlag = async (id: string, key: "isPinned" | "isFavorite"): Promise<void> => {
    const previousNotes = get().notes;
    const previousNote = previousNotes.find((n) => n.id === id);
    const optimisticNote: Note | null = previousNote
      ? { ...previousNote, [key]: !previousNote[key] }
      : null;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id && optimisticNote ? optimisticNote : n)),
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
      if (previousNote && optimisticNote && vaultService.isUnlocked()) {
        set((state) => ({
          notes: state.notes.map((n) => (n === optimisticNote ? previousNote : n)),
        }));
      }
      notifyError(err);
    }
  };

  const listAndRegister = async (workspaceId: string): Promise<Note[] | null> => {
    try {
      const notes = await noteService.listMetadataByWorkspace(workspaceId);
      blockSuiteEditorService.registerExistingNotes(
        notes.map((n) => ({ id: n.id, title: n.title })),
      );
      return notes;
    } catch (err) {
      notifyError(err, { saveStatus: false });
      return null;
    }
  };

  return {
    notes: [],
    trashedNotes: [],
    activeNoteId: null,
    activeCoverImage: null,

    setActiveNoteId: (id) => {
      // Opening a note always returns the main area to the editor page
      // (leaving Library/Journals/Trash behind).
      useUIStore.getState().setActivePage("editor");
      set({ activeNoteId: id, activeCoverImage: null });
    },

    fetchNotes: async (workspaceId) => {
      const notes = await listAndRegister(workspaceId);
      if (!notes) return;
      set((state) => ({
        notes,
        activeNoteId:
          state.activeNoteId && notes.some((n) => n.id === state.activeNoteId)
            ? state.activeNoteId
            : (notes[0]?.id ?? null),
        activeCoverImage: state.activeCoverImage,
      }));
    },

    refreshNotesInPlace: async (workspaceId) => {
      await get().fetchNotes(workspaceId);
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
      const previousNote = previousNotes.find((n) => n.id === id);
      const now = Date.now();
      const optimisticNote: Note | undefined = previousNote
        ? { ...previousNote, ...updates, updatedAt: now }
        : undefined;
      const optimisticNotes = previousNotes.map((n) =>
        n.id === id && optimisticNote ? optimisticNote : n,
      );
      set({ notes: optimisticNotes });
      useSaveStatusStore.getState().setSaving();

      try {
        const { content, ...metadata } = updates;
        if (content !== undefined) {
          await noteService.updateContent(id, content);
          invalidateNoteBacklinkScan(id);
        }
        if (Object.keys(metadata).length > 0) {
          await noteService.updateMetadata(id, metadata);
        }

        if (updates.title !== undefined) {
          blockSuiteEditorService.setDocTitle(id, updates.title);
        }
        useSaveStatusStore.getState().setSaved();
      } catch (err) {
        if (previousNote && optimisticNote && vaultService.isUnlocked()) {
          set((state) => ({
            notes: state.notes.map((n) => (n === optimisticNote ? previousNote : n)),
          }));
        }
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
        invalidateNoteBacklinkScan(id);
        useSaveStatusStore.getState().setSaved();
        useNotificationStore.getState().pushToast({
          kind: "info",
          title: MESSAGES.TRASH_MOVED_TOAST,
          description: MESSAGES.TRASH_MOVED_DESC,
        });
      } catch (err) {
        if (vaultService.isUnlocked()) {
          set({ notes: previousNotes, activeNoteId: previousActive });
        }
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
          blockSuiteEditorService.registerExistingNotes(
            notes.map((n) => ({ id: n.id, title: n.title })),
          );
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
        invalidateNoteBacklinkScan(id);
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
        blockSuiteEditorService.registerExistingNotes([
          { id: duplicated.id, title: duplicated.title },
        ]);
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
  clearBacklinkScans();
  useNoteStore.setState({
    notes: [],
    trashedNotes: [],
    activeNoteId: null,
    activeCoverImage: null,
  });
});

blockSuiteEditorService.provideDocCreatedHandler(async (docId, title) => {
  const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
  if (!activeWs) return;
  await noteService.createNoteWithId(activeWs, docId, title);

  await useNoteStore.getState().refreshNotesInPlace(activeWs);
});

blockSuiteEditorService.provideNoteSavedHandler(async (docId, content) => {
  await useNoteStore.getState().updateNote(docId, { content });
});
