import { create } from "zustand";
import { seedKnownEmptyNote } from "../components/library/libraryListCache";
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
  /** Drops any in-flight notes fetch (vault lock wipes the list). */
  invalidateInFlightFetches: () => void;

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
      await runNoteWrite(() =>
        key === "isPinned" ? noteService.togglePin(id) : noteService.toggleFavorite(id),
      );
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
      return await noteService.listMetadataByWorkspace(workspaceId);
    } catch (err) {
      notifyError(err, { saveStatus: false });
      return null;
    }
  };

  // Fetch/mutation coordination. A fetch is dropped at land time when it is
  // superseded, when ANY note write is still in flight (its snapshot may
  // predate the write), or when its workspace is no longer active. Every
  // write bumps fetchSeq after committing (killing fetches whose read
  // predates it) and re-loads the active workspace's list if the store was
  // still holding another workspace's (the killed fetch may have been the
  // only fresh source).
  let fetchSeq = 0;
  let pendingWrites = 0;
  let loadedWorkspaceId: string | null = null;

  const isStaleFetch = (seq: number, workspaceId: string): boolean =>
    seq !== fetchSeq ||
    pendingWrites > 0 ||
    useWorkspaceStore.getState().activeWorkspaceId !== workspaceId;

  const runNoteWrite = async <T>(op: () => Promise<T>): Promise<T> => {
    pendingWrites += 1;
    try {
      return await op();
    } finally {
      pendingWrites -= 1;
      fetchSeq += 1;
      const active = useWorkspaceStore.getState().activeWorkspaceId;
      if (active && loadedWorkspaceId !== active) {
        void get().fetchNotes(active);
      }
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
      const seq = ++fetchSeq;
      const notes = await listAndRegister(workspaceId);
      if (!notes) return;
      // Stale = superseded by a newer fetch, invalidated by a local mutation,
      // or captured for a workspace the user has since left. Dropping it here
      // (before registerExistingNotes) also keeps its doc-registry side
      // effects from evicting the active workspace's docs.
      if (isStaleFetch(seq, workspaceId)) return;
      blockSuiteEditorService.registerExistingNotes(
        notes.map((n) => ({ id: n.id, title: n.title })),
      );
      loadedWorkspaceId = workspaceId;
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

    invalidateInFlightFetches: () => {
      fetchSeq += 1;
      loadedWorkspaceId = null;
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
        const created = await runNoteWrite(() =>
          noteService.createNote(workspaceId, title, content, icon),
        );

        blockSuiteEditorService.registerExistingNotes([{ id: created.id, title: created.title }]);
        // Creating a note opens it: return the main area to the editor even
        // when the trigger sits on the Library/Journals/Trash page.
        useUIStore.getState().setActivePage("editor");
        // A created note has provably empty filter inputs — record it so
        // emptiness-rule views in the Library can show it immediately
        // instead of deferring it to revalidation.
        seedKnownEmptyNote(workspaceId, created.id);
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
        await runNoteWrite(async () => {
          if (content !== undefined) {
            await noteService.updateContent(id, content);
            invalidateNoteBacklinkScan(id);
          }
          if (Object.keys(metadata).length > 0) {
            await noteService.updateMetadata(id, metadata);
          }
        });

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
        await runNoteWrite(() => noteService.updateMetadata(id, { workspaceId }));
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
        await runNoteWrite(() => noteService.trashNote(id));
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
        await runNoteWrite(() => noteService.restoreNote(id));
      } catch (err) {
        if (trashed) {
          set((state) => ({ trashedNotes: [trashed, ...state.trashedNotes] }));
        }
        notifyError(err, { saveStatus: false });
        return;
      }
      // The DB restore committed — a failed refresh must never roll a live
      // note back into the Trash list, nor leave it absent from every list.
      const activeWorkspaceId = useWorkspaceStore.getState().activeWorkspaceId;
      if (!trashed || trashed.workspaceId !== activeWorkspaceId) return;
      const seq = fetchSeq;
      try {
        const notes = await noteService.listMetadataByWorkspace(activeWorkspaceId);
        // Same land-time guard as fetchNotes: a newer fetch or a workspace
        // switch during the await must win.
        if (isStaleFetch(seq, activeWorkspaceId)) return;
        blockSuiteEditorService.registerExistingNotes(
          notes.map((n) => ({ id: n.id, title: n.title })),
        );
        loadedWorkspaceId = activeWorkspaceId;
        set({ notes });
      } catch (err) {
        notifyError(err, { saveStatus: false });
        if (!isStaleFetch(seq, activeWorkspaceId)) {
          set((state) => ({
            notes: state.notes.some((n) => n.id === id) ? state.notes : [trashed, ...state.notes],
          }));
        }
      }
    },

    deleteNotePermanently: async (id) => {
      const previousTrash = get().trashedNotes;
      set((state) => ({ trashedNotes: state.trashedNotes.filter((n) => n.id !== id) }));

      try {
        await runNoteWrite(() => noteService.deleteNote(id));
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
        const duplicated = await runNoteWrite(() => noteService.duplicateNote(id));
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
  useNoteStore.getState().invalidateInFlightFetches();
  useNoteStore.setState({
    notes: [],
    trashedNotes: [],
    activeNoteId: null,
    activeCoverImage: null,
  });
});

blockSuiteEditorService.provideDocCreatedHandler(async (docId, title) => {
  const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
  // Rejecting (not returning) lets the editor drop the unpersistable doc and
  // the markdown import count the file as failed.
  if (!activeWs) throw new Error("No active workspace to persist a new doc into.");
  try {
    await noteService.createNoteWithId(activeWs, docId, title);
  } catch (err) {
    // Editor-created docs have no awaiter — surface the failure here. The
    // tag lets awaiting callers (markdown import) skip their own toast.
    notifyError(err, { saveStatus: false });
    if (err instanceof Error) {
      (err as Error & { coveAlreadyNotified?: boolean }).coveAlreadyNotified = true;
    }
    throw err;
  }

  await useNoteStore.getState().refreshNotesInPlace(activeWs);
});

blockSuiteEditorService.provideNoteSavedHandler(async (docId, content) => {
  await useNoteStore.getState().updateNote(docId, { content });
});
