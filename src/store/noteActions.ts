import { MESSAGES } from "../constants/messages";
import { blockSuiteEditorService, noteService, vaultService } from "../di/container";
import type { Note } from "../domain/note/Note";
import { invalidateNoteBacklinkScan } from "../services/editor/backlinkScan";
import { seedKnownEmptyNote } from "../services/library/libraryListCache";
import { processCoverImage } from "../utils/coverImage";
import { notifyErrorWithSaveStatus as notifyError } from "./notify";
import { fetchNotes as fetchNotesFn, notesKey, queryClient, trashKey } from "./queryClient";
import { useNoteUiStore } from "./useNoteUiStore";
import { useNotificationStore } from "./useNotificationStore";
import { useSaveStatusStore } from "./useSaveStatusStore";
import { useUIStore } from "./useUIStore";
import { useWorkspaceStore } from "./useWorkspaceStore";

const activeWorkspaceId = () => useWorkspaceStore.getState().activeWorkspaceId;

const readNotes = (ws: string): Note[] => queryClient.getQueryData(notesKey(ws)) ?? [];

const writeNotes = (ws: string, notes: Note[]): void => {
  queryClient.setQueryData(notesKey(ws), notes);
};

const readTrash = (): Note[] => queryClient.getQueryData(trashKey) ?? [];

const writeTrash = (notes: Note[]): void => {
  queryClient.setQueryData(trashKey, notes);
};

/** Finds the cache entry holding a note (mutations may target a note from a
 *  non-active workspace, e.g. a peeked backlink). */
function cacheOf(id: string): { ws: string; notes: Note[] } | null {
  for (const [key, cached] of queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] })) {
    if (cached?.some((n) => n.id === id)) {
      return { ws: String(key[1] ?? ""), notes: cached };
    }
  }
  return null;
}

/** Marks every notes list stale and refetches, resolving only once the fresh
 *  data has landed — awaited callers (journal open, restore, import) can rely
 *  on the note being present afterwards. */
async function invalidateNotes(): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ["notes"], refetchType: "all" });
}

export const noteActions = {
  /** Ensures the workspace's list is cached (fetches on first use). */
  async fetchNotes(ws: string): Promise<void> {
    await queryClient.ensureQueryData({
      queryKey: notesKey(ws),
      queryFn: () => fetchNotesFn(ws),
    });
  },

  /** Forces a refetch of the workspace's list, resolving after it lands. */
  async refreshNotesInPlace(ws: string): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: notesKey(ws), refetchType: "all" });
  },

  /** Snapshot for non-React code (polling, guards). */
  currentNotes(ws: string | null | undefined = activeWorkspaceId()): Note[] {
    return ws ? readNotes(ws) : [];
  },

  async loadActiveNoteContent(id: string): Promise<void> {
    try {
      const [note, cover] = await Promise.all([
        noteService.getNote(id),
        noteService.getCoverImage(id),
      ]);
      if (useNoteUiStore.getState().activeNoteId !== id) return;
      if (note) {
        const entry = cacheOf(id);
        if (entry) {
          writeNotes(
            entry.ws,
            entry.notes.map((n) => (n.id === id ? note : n)),
          );
        }
      }
      useNoteUiStore.setState({ activeCoverImage: cover });
    } catch (err) {
      notifyError(err, { saveStatus: false });
    }
  },

  async createNote(
    ws: string,
    title?: string,
    content?: string,
    icon?: string,
  ): Promise<Note | null> {
    useSaveStatusStore.getState().setSaving();
    try {
      const created = await noteService.createNote(ws, title, content, icon);
      blockSuiteEditorService.registerExistingNotes([{ id: created.id, title: created.title }]);
      // Creating a note opens it: return the main area to the editor even
      // when the trigger sits on the Library/Journals/Trash page.
      useUIStore.getState().setActivePage("editor");
      // A created note has provably empty filter inputs — record it so
      // emptiness-rule views in the Library can show it immediately.
      seedKnownEmptyNote(ws, created.id);
      writeNotes(ws, [created, ...readNotes(ws)]);
      useNoteUiStore.getState().setActiveNoteId(created.id);
      useSaveStatusStore.getState().setSaved();
      return created;
    } catch (err) {
      notifyError(err);
      return null;
    }
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    const entry = cacheOf(id);
    const previous = entry?.notes.find((n) => n.id === id);
    const optimistic = previous ? { ...previous, ...updates, updatedAt: Date.now() } : undefined;
    if (entry && optimistic) {
      writeNotes(
        entry.ws,
        entry.notes.map((n) => (n.id === id ? optimistic : n)),
      );
    }
    useSaveStatusStore.getState().setSaving();

    try {
      const { content, ...metadata } = updates;
      let saved: Note | null = null;
      if (content !== undefined) {
        saved = await noteService.updateContent(id, content);
        invalidateNoteBacklinkScan(id);
      }
      if (Object.keys(metadata).length > 0) {
        saved = await noteService.updateMetadata(id, metadata);
      }
      if (updates.title !== undefined) {
        blockSuiteEditorService.setDocTitle(id, updates.title);
      }
      if (entry && saved) {
        writeNotes(
          entry.ws,
          readNotes(entry.ws).map((n) => (n.id === id ? saved : n)),
        );
      }
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      if (entry && previous && optimistic && vaultService.isUnlocked()) {
        writeNotes(
          entry.ws,
          readNotes(entry.ws).map((n) => (n.id === id ? previous : n)),
        );
      }
      notifyError(err);
    }
  },

  async uploadCoverImage(id: string, file: File): Promise<void> {
    useSaveStatusStore.getState().setSaving();
    try {
      const dataUrl = await processCoverImage(file);
      await noteService.setCoverImage(id, dataUrl);
      if (useNoteUiStore.getState().activeNoteId === id) {
        useNoteUiStore.setState({ activeCoverImage: dataUrl });
      }
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      notifyError(err);
    }
  },

  async removeCoverImage(id: string): Promise<void> {
    const previous = useNoteUiStore.getState().activeCoverImage;
    if (useNoteUiStore.getState().activeNoteId === id) {
      useNoteUiStore.setState({ activeCoverImage: null });
    }
    useSaveStatusStore.getState().setSaving();
    try {
      await noteService.removeCoverImage(id);
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      if (useNoteUiStore.getState().activeNoteId === id) {
        useNoteUiStore.setState({ activeCoverImage: previous });
      }
      notifyError(err);
    }
  },

  async moveNoteToWorkspace(id: string, ws: string): Promise<void> {
    useSaveStatusStore.getState().setSaving();
    try {
      const source = cacheOf(id);
      await noteService.updateMetadata(id, { workspaceId: ws });
      if (source) {
        writeNotes(
          source.ws,
          readNotes(source.ws).filter((n) => n.id !== id),
        );
      }
      useWorkspaceStore.getState().setActiveWorkspace(ws);
      await noteActions.fetchNotes(ws);
      useNoteUiStore.getState().setActiveNoteId(id);
      await noteActions.loadActiveNoteContent(id);
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      notifyError(err);
    }
  },

  async trashNote(id: string): Promise<void> {
    const entry = cacheOf(id);
    const previousNotes = entry?.notes ?? [];
    const previousActive = useNoteUiStore.getState().activeNoteId;
    const filtered = previousNotes.filter((n) => n.id !== id);
    const wasActive = previousActive === id;
    if (entry) writeNotes(entry.ws, filtered);
    if (wasActive) {
      useNoteUiStore.setState({
        activeNoteId: filtered[0]?.id ?? null,
        activeCoverImage: null,
      });
    }
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
      await queryClient.invalidateQueries({ queryKey: trashKey });
    } catch (err) {
      if (entry && vaultService.isUnlocked()) {
        writeNotes(entry.ws, previousNotes);
        useNoteUiStore.setState({ activeNoteId: previousActive });
      }
      notifyError(err);
    }
  },

  async restoreNote(id: string): Promise<void> {
    const trashed = readTrash().find((n) => n.id === id);
    writeTrash(readTrash().filter((n) => n.id !== id));

    try {
      await noteService.restoreNote(id);
    } catch (err) {
      if (trashed) writeTrash([trashed, ...readTrash()]);
      notifyError(err, { saveStatus: false });
      return;
    }
    // The restore committed — refetching the owning workspace's list (and
    // the trash list) can only ADD the note back; a failed refetch never
    // re-trashes it.
    await invalidateNotes();
    await queryClient.invalidateQueries({ queryKey: trashKey });
  },

  async deleteNotePermanently(id: string): Promise<void> {
    const previousTrash = readTrash();
    writeTrash(previousTrash.filter((n) => n.id !== id));
    try {
      await noteService.deleteNote(id);
      invalidateNoteBacklinkScan(id);
      await queryClient.invalidateQueries({ queryKey: trashKey });
    } catch (err) {
      writeTrash(previousTrash);
      notifyError(err, { saveStatus: false });
    }
  },

  async purgeExpiredTrash(): Promise<void> {
    try {
      await noteService.purgeExpiredTrash();
      await queryClient.invalidateQueries({ queryKey: trashKey });
    } catch (err) {
      notifyError(err, { saveStatus: false });
    }
  },

  async duplicateNote(id: string): Promise<void> {
    useSaveStatusStore.getState().setSaving();
    try {
      const duplicated = await noteService.duplicateNote(id);
      blockSuiteEditorService.registerExistingNotes([
        { id: duplicated.id, title: duplicated.title },
      ]);
      const ws = activeWorkspaceId() ?? duplicated.workspaceId;
      writeNotes(ws, [duplicated, ...readNotes(ws)]);
      useNoteUiStore.getState().setActiveNoteId(duplicated.id);
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      notifyError(err);
    }
  },

  async toggleFlag(id: string, key: "isPinned" | "isFavorite"): Promise<void> {
    const entry = cacheOf(id);
    const previous = entry?.notes.find((n) => n.id === id);
    const optimistic = previous ? { ...previous, [key]: !previous[key] } : null;
    if (entry && optimistic) {
      writeNotes(
        entry.ws,
        entry.notes.map((n) => (n.id === id ? optimistic : n)),
      );
    }
    useSaveStatusStore.getState().setSaving();

    try {
      const saved =
        key === "isPinned" ? await noteService.togglePin(id) : await noteService.toggleFavorite(id);
      if (entry) {
        writeNotes(
          entry.ws,
          readNotes(entry.ws).map((n) => (n.id === id ? saved : n)),
        );
      }
      useSaveStatusStore.getState().setSaved();
    } catch (err) {
      if (entry && previous && optimistic && vaultService.isUnlocked()) {
        writeNotes(
          entry.ws,
          readNotes(entry.ws).map((n) => (n.id === id ? previous : n)),
        );
      }
      notifyError(err);
    }
  },

  togglePinNote: (id: string) => noteActions.toggleFlag(id, "isPinned"),
  toggleFavoriteNote: (id: string) => noteActions.toggleFlag(id, "isFavorite"),

  /** Persists an editor/import-created doc as a note row. */
  async persistDocCreatedNote(ws: string, docId: string, title?: string): Promise<Note> {
    const created = await noteService.createNoteWithId(ws, docId, title);
    await noteActions.refreshNotesInPlace(ws);
    return created;
  },
};

blockSuiteEditorService.provideDocCreatedHandler(async (docId, title) => {
  const activeWs = useWorkspaceStore.getState().activeWorkspaceId;
  // Rejecting (not returning) lets the editor drop the unpersistable doc and
  // the markdown import count the file as failed.
  if (!activeWs) throw new Error("No active workspace to persist a new doc into.");
  try {
    await noteActions.persistDocCreatedNote(activeWs, docId, title);
  } catch (err) {
    // Editor-created docs have no awaiter — surface the failure here. The
    // tag lets awaiting callers (markdown import) skip their own toast.
    notifyError(err, { saveStatus: false });
    const tagged =
      err instanceof Error
        ? err
        : new Error(err instanceof Object ? String(err) : "doc persist failed");
    (tagged as Error & { coveAlreadyNotified?: boolean }).coveAlreadyNotified = true;
    throw tagged;
  }
});

blockSuiteEditorService.provideNoteSavedHandler(async (docId, content) => {
  await noteActions.updateNote(docId, { content });
});
