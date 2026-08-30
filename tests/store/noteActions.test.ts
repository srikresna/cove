import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  togglePin,
  toggleFavorite,
  updateContent,
  updateMetadata,
  createNoteWithId,
  createNote,
  listMetadataByWorkspace,
  restoreNote,
  trashNoteSvc,
  invalidateNoteBacklinkScan,
  vault,
  handlers,
} = vi.hoisted(() => ({
  togglePin: vi.fn<(id: string) => Promise<Note>>(),
  toggleFavorite: vi.fn<(id: string) => Promise<Note>>(),
  updateContent: vi.fn<(id: string, content: string) => Promise<Note>>(),
  updateMetadata: vi.fn<(id: string, updates: Record<string, unknown>) => Promise<Note>>(),
  createNoteWithId: vi.fn<(wsId: string, id: string, title?: string) => Promise<Note>>(),
  createNote: vi.fn<(wsId: string, title?: string) => Promise<Note>>(),
  listMetadataByWorkspace: vi.fn<(wsId: string) => Promise<Note[]>>(),
  restoreNote: vi.fn<(id: string) => Promise<void>>(),
  trashNoteSvc: vi.fn<(id: string) => Promise<void>>(),
  invalidateNoteBacklinkScan: vi.fn<(noteId: string) => void>(),
  vault: { unlocked: true },
  handlers: {
    docCreated: null as ((docId: string, title?: string) => Promise<void>) | null,
    noteSaved: null as ((docId: string, content: string) => Promise<void>) | null,
  },
}));

vi.mock("@/services/editor/backlinkScan", () => ({ invalidateNoteBacklinkScan }));

vi.mock("@/di/container", () => ({
  noteService: {
    togglePin,
    toggleFavorite,
    updateContent,
    updateMetadata,
    createNoteWithId,
    createNote,
    listMetadataByWorkspace,
    restoreNote,
    trashNote: trashNoteSvc,
    getNote: vi.fn(),
    getCoverImage: vi.fn().mockResolvedValue(null),
    listTrash: vi.fn().mockResolvedValue([]),
  },
  vaultService: {
    isUnlocked: () => vault.unlocked,
    onLock: (fn: () => void) => {
      void fn;
    },
  },
  blockSuiteEditorService: {
    isWorkspaceAlive: () => true,
    registerPendingFlusher: () => () => {},
    provideDocCreatedHandler: (fn: (docId: string, title?: string) => Promise<void>) => {
      handlers.docCreated = fn;
    },
    provideNoteSavedHandler: (fn: (docId: string, content: string) => Promise<void>) => {
      handlers.noteSaved = fn;
    },
    setDocTitle: vi.fn(),
    provideCanvasPrefs: () => {},
    getViewSpecs: () => [],
    registerExistingNotes: vi.fn(),
  },
}));

import type { Note } from "@/domain/note/Note";
import { noteActions } from "@/store/noteActions";
import { notesKey, queryClient } from "@/store/queryClient";
import { useNoteUiStore } from "@/store/useNoteUiStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "n1",
    workspaceId: "ws1",
    title: "Test",
    content: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPinned: false,
    isFavorite: false,
    ...overrides,
  } as Note;
}

const seedCache = (notes: Note[]): void => {
  queryClient.setQueryData(notesKey("ws1"), notes);
};

describe("noteActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    queryClient.clear();
    // Seeded entries carry no queryFn of their own — register one so
    // invalidation-driven refetches have a fetcher to run.
    queryClient.setQueryDefaults(notesKey("ws1"), {
      queryFn: () => listMetadataByWorkspace("ws1"),
    });
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "n1" })]);
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
    useNoteUiStore.setState({ activeNoteId: null, activeCoverImage: null });
    seedCache([makeNote({ id: "n1", isPinned: false })]);
  });

  it("optimistically flips isPinned and persists the returned note", async () => {
    togglePin.mockResolvedValue(makeNote({ isPinned: true }));

    await noteActions.togglePinNote("n1");

    expect(togglePin).toHaveBeenCalledWith("n1");
    const cached = queryClient.getQueryData<Note[]>(notesKey("ws1"));
    expect(cached?.[0]?.isPinned).toBe(true);
  });

  it("rolls back the flip when the service throws while unlocked", async () => {
    togglePin.mockRejectedValue(new Error("DB down"));

    await noteActions.togglePinNote("n1");

    expect(queryClient.getQueryData<Note[]>(notesKey("ws1"))?.[0]?.isPinned).toBe(false);
  });

  it("updateNote splits content vs metadata and invalidates the backlink scan", async () => {
    updateContent.mockResolvedValue(makeNote({ content: "doc-v2" }));

    await noteActions.updateNote("n1", { content: "doc-v2" });

    expect(updateContent).toHaveBeenCalledWith("n1", "doc-v2");
    expect(invalidateNoteBacklinkScan).toHaveBeenCalledWith("n1");
    expect(updateMetadata).not.toHaveBeenCalled();
    expect(queryClient.getQueryData<Note[]>(notesKey("ws1"))?.[0]?.content).toBe("doc-v2");
  });

  it("createNote prepends to the cache, opens it, and seeds the emptiness cache", async () => {
    const created = makeNote({ id: "fresh", title: "Fresh" });
    createNote.mockResolvedValue(created);

    const out = await noteActions.createNote("ws1", "Fresh");

    expect(out?.id).toBe("fresh");
    expect(queryClient.getQueryData<Note[]>(notesKey("ws1"))?.[0]?.id).toBe("fresh");
    expect(useNoteUiStore.getState().activeNoteId).toBe("fresh");
  });

  it("trashNote removes the note optimistically and rolls back on failure", async () => {
    trashNoteSvc.mockRejectedValue(new Error("db down"));
    useNoteUiStore.setState({ activeNoteId: "n1" });

    await noteActions.trashNote("n1");

    expect(queryClient.getQueryData<Note[]>(notesKey("ws1"))?.[0]?.id).toBe("n1");
    expect(useNoteUiStore.getState().activeNoteId).toBe("n1");
  });

  it("trashNote keeps the removal when the service succeeds", async () => {
    trashNoteSvc.mockResolvedValue(undefined);

    await noteActions.trashNote("n1");

    expect(queryClient.getQueryData<Note[]>(notesKey("ws1"))).toHaveLength(0);
  });

  it("restoreNote re-adds to the trash cache only when the DB restore fails", async () => {
    queryClient.setQueryData(["trash"], [makeNote({ id: "t1", workspaceId: "ws1" })]);
    restoreNote.mockRejectedValue(new Error("db down"));

    await noteActions.restoreNote("t1");

    expect(restoreNote).toHaveBeenCalledWith("t1");
    // The optimistic trash removal rolled back.
    expect(queryClient.getQueryData<Note[]>(["trash"])?.[0]?.id).toBe("t1");
  });

  it("restoreNote refetches the workspace list after a successful restore", async () => {
    queryClient.setQueryData(["trash"], [makeNote({ id: "t1", workspaceId: "ws1" })]);
    restoreNote.mockResolvedValue(undefined);
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "t1" }), makeNote({ id: "n1" })]);

    await noteActions.restoreNote("t1");

    expect(listMetadataByWorkspace).toHaveBeenCalledWith("ws1");
    expect(queryClient.getQueryData<Note[]>(notesKey("ws1"))?.map((n) => n.id)).toContain("t1");
  });

  it("fetchNotes selects the first note when nothing valid is active (passive paths)", async () => {
    queryClient.clear();
    queryClient.setQueryDefaults(notesKey("ws1"), {
      queryFn: () => listMetadataByWorkspace("ws1"),
    });
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "a" }), makeNote({ id: "b" })]);
    useNoteUiStore.setState({ activeNoteId: null });

    await noteActions.fetchNotes("ws1");

    expect(useNoteUiStore.getState().activeNoteId).toBe("a");
  });

  it("fetchNotes keeps an active note that exists in the landed list", async () => {
    queryClient.clear();
    queryClient.setQueryDefaults(notesKey("ws1"), {
      queryFn: () => listMetadataByWorkspace("ws1"),
    });
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "a" }), makeNote({ id: "b" })]);
    useNoteUiStore.setState({ activeNoteId: "b" });

    await noteActions.fetchNotes("ws1");

    expect(useNoteUiStore.getState().activeNoteId).toBe("b");
  });

  it("loadActiveNoteContent fetches the owning workspace's cache for a cross-ws note", async () => {
    const { getNote, getCoverImage } = (await import("@/di/container")).noteService as unknown as {
      getNote: ReturnType<typeof vi.fn>;
      getCoverImage: ReturnType<typeof vi.fn>;
    };
    getNote.mockResolvedValue(makeNote({ id: "x-ws2", workspaceId: "ws2", content: "full" }));
    getCoverImage.mockResolvedValue(null);
    queryClient.setQueryDefaults(notesKey("ws2"), {
      queryFn: () => listMetadataByWorkspace("ws2"),
    });
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "x-ws2", workspaceId: "ws2" })]);
    useNoteUiStore.setState({ activeNoteId: "x-ws2" });

    await noteActions.loadActiveNoteContent("x-ws2");

    const ws2 = queryClient.getQueryData<Note[]>(notesKey("ws2"));
    expect(ws2?.[0]?.content).toBe("full");
  });

  it("doc-created handler rejects (tagged) when there is no active workspace", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: null });

    await expect(handlers.docCreated?.("doc-x", "T")).rejects.toThrow();
  });

  it("doc-created handler rejects when the notes row cannot be created", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
    createNoteWithId.mockRejectedValue(new Error("insert failed"));

    await expect(handlers.docCreated?.("doc-x", "T")).rejects.toThrow("insert failed");
  });
});
