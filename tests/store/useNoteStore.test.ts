import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  togglePin,
  toggleFavorite,
  updateContent,
  updateMetadata,
  createNoteWithId,
  listMetadataByWorkspace,
  restoreNote,
  invalidateNoteBacklinkScan,
  clearBacklinkScans,
  setDocTitle,
  vault,
  handlers,
} = vi.hoisted(() => ({
  togglePin: vi.fn<(id: string) => Promise<void>>(),
  toggleFavorite: vi.fn<(id: string) => Promise<void>>(),
  updateContent: vi.fn<(id: string, content: string) => Promise<Note>>(),
  updateMetadata: vi.fn<(id: string, updates: Record<string, unknown>) => Promise<Note>>(),
  createNoteWithId: vi.fn<(wsId: string, id: string, title?: string) => Promise<Note>>(),
  listMetadataByWorkspace: vi.fn<(wsId: string) => Promise<Note[]>>(),
  restoreNote: vi.fn<(id: string) => Promise<void>>(),
  invalidateNoteBacklinkScan: vi.fn<(noteId: string) => void>(),
  clearBacklinkScans: vi.fn<() => void>(),
  setDocTitle: vi.fn<(docId: string, title: string) => void>(),
  vault: { unlocked: true, locking: false },
  handlers: {
    lock: null as (() => void) | null,
    docCreated: null as ((docId: string, title?: string) => Promise<void>) | null,
    noteSaved: null as ((docId: string, content: string) => Promise<void>) | null,
  },
}));

vi.mock("@/services/editor/backlinkScan", () => ({
  invalidateNoteBacklinkScan,
  clearBacklinkScans,
}));

vi.mock("@/di/container", () => ({
  noteService: {
    togglePin,
    toggleFavorite,
    updateContent,
    updateMetadata,
    createNoteWithId,
    listMetadataByWorkspace,
    restoreNote,
  },
  vaultService: {
    isUnlocked: () => vault.unlocked && !vault.locking,
    onLock: (fn: () => void) => {
      handlers.lock = fn;
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
    setDocTitle,
    provideCanvasPrefs: () => {},
    getViewSpecs: () => [],
    registerExistingNotes: () => {},
  },
}));

import type { Note } from "@/domain/note/Note";
import { useNoteStore } from "@/store/useNoteStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "n1",
    workspaceId: "ws1",
    title: "Test",
    content: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    docMode: "page",
    isPinned: false,
    isFavorite: false,
    isTrashed: false,
    trashedAt: null,
    coverImage: null,
    icon: null,
    ...overrides,
  } as Note;
}

describe("useNoteStore — optimistic update & rollback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    useNoteStore.setState({
      notes: [makeNote({ id: "n1", isPinned: false })],
      trashedNotes: [],
      activeNoteId: "n1",
      activeCoverImage: null,
    });
  });

  it("optimistically flips isPinned before the service resolves", async () => {
    let resolvePin: () => void = () => {};
    togglePin.mockReturnValue(
      new Promise<void>((r) => {
        resolvePin = r;
      }),
    );

    const flip = useNoteStore.getState().togglePinNote("n1");

    expect(useNoteStore.getState().notes[0]?.isPinned).toBe(true);

    resolvePin();
    await flip;
    expect(useNoteStore.getState().notes[0]?.isPinned).toBe(true);
  });

  it("rolls back isPinned when the service throws", async () => {
    togglePin.mockRejectedValue(new Error("DB down"));

    await useNoteStore.getState().togglePinNote("n1");
    expect(useNoteStore.getState().notes[0]?.isPinned).toBe(false);
  });

  it("optimistically flips isFavorite then persists", async () => {
    toggleFavorite.mockResolvedValue(undefined);

    await useNoteStore.getState().toggleFavoriteNote("n1");
    expect(useNoteStore.getState().notes[0]?.isFavorite).toBe(true);
    expect(toggleFavorite).toHaveBeenCalledWith("n1");
  });

  it("does not optimistically mutate other notes", async () => {
    useNoteStore.setState({
      notes: [makeNote({ id: "n1", isPinned: false }), makeNote({ id: "n2", isPinned: false })],
    });
    togglePin.mockResolvedValue(undefined);

    await useNoteStore.getState().togglePinNote("n2");
    const notes = useNoteStore.getState().notes;
    expect(notes[0]?.isPinned).toBe(false);
    expect(notes[1]?.isPinned).toBe(true);
  });
});

describe("useNoteStore — updateNote persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    useNoteStore.setState({
      notes: [makeNote({ id: "n1", title: "Test", content: "" })],
      trashedNotes: [],
      activeNoteId: "n1",
      activeCoverImage: null,
    });
  });

  it("saves content via updateContent and invalidates the backlink scan", async () => {
    updateContent.mockResolvedValue(makeNote({ content: "doc-v2" }));

    await useNoteStore.getState().updateNote("n1", { content: "doc-v2" });

    expect(updateContent).toHaveBeenCalledWith("n1", "doc-v2");
    expect(invalidateNoteBacklinkScan).toHaveBeenCalledWith("n1");
    expect(updateMetadata).not.toHaveBeenCalled();
  });

  it("saves title via updateMetadata and syncs the editor doc title", async () => {
    updateMetadata.mockResolvedValue(makeNote({ title: "Renamed" }));

    await useNoteStore.getState().updateNote("n1", { title: "Renamed" });

    expect(updateMetadata).toHaveBeenCalledWith("n1", { title: "Renamed" });
    expect(setDocTitle).toHaveBeenCalledWith("n1", "Renamed");
    expect(updateContent).not.toHaveBeenCalled();
  });

  it("restores the previous notes when updateContent rejects while unlocked", async () => {
    updateContent.mockRejectedValue(new Error("disk full"));

    await useNoteStore.getState().updateNote("n1", { content: "doc-v2" });

    expect(useNoteStore.getState().notes[0]?.content).toBe("");
  });

  it("keeps the optimistic notes when the vault is locked on failure", async () => {
    vault.unlocked = false;
    updateContent.mockRejectedValue(new Error("locked mid-flush"));

    await useNoteStore.getState().updateNote("n1", { content: "doc-v2" });

    expect(useNoteStore.getState().notes[0]?.content).toBe("doc-v2");
  });
});

describe("useNoteStore — container handler wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    useNoteStore.setState({
      notes: [makeNote({ id: "n1" })],
      trashedNotes: [makeNote({ id: "t1" })],
      activeNoteId: "n1",
      activeCoverImage: "cover-data",
    });
  });

  it("clears note state and backlink scans when the vault locks", () => {
    handlers.lock?.();

    const state = useNoteStore.getState();
    expect(state.notes).toEqual([]);
    expect(state.trashedNotes).toEqual([]);
    expect(state.activeNoteId).toBeNull();
    expect(state.activeCoverImage).toBeNull();
    expect(clearBacklinkScans).toHaveBeenCalledTimes(1);
  });

  it("persists editor-created docs then refreshes the note list in place", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
    createNoteWithId.mockResolvedValue(makeNote({ id: "doc-x", title: "New doc" }));
    listMetadataByWorkspace.mockResolvedValue([
      makeNote({ id: "doc-x", title: "New doc" }),
      makeNote({ id: "n1" }),
    ]);

    await handlers.docCreated?.("doc-x", "New doc");

    expect(createNoteWithId).toHaveBeenCalledWith("ws1", "doc-x", "New doc");
    expect(listMetadataByWorkspace).toHaveBeenCalledWith("ws1");
    expect(useNoteStore.getState().notes.map((n) => n.id)).toContain("doc-x");
  });

  it("routes editor note saves into updateNote", async () => {
    updateContent.mockResolvedValue(makeNote());

    await handlers.noteSaved?.("n1", "saved-content");

    expect(updateContent).toHaveBeenCalledWith("n1", "saved-content");
    expect(invalidateNoteBacklinkScan).toHaveBeenCalledWith("n1");
  });
});

describe("useNoteStore — refreshNotesInPlace (peek-created docs)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
    useNoteStore.setState({
      notes: [makeNote({ id: "cal-note", title: "Calendar" })],
      trashedNotes: [],
      activeNoteId: "cal-note",
      activeCoverImage: "cover-data",
    });
  });

  it("keeps activeNoteId and activeCoverImage when a new note appears (stay in calendar)", async () => {
    listMetadataByWorkspace.mockResolvedValue([
      makeNote({ id: "new-doc", title: "Linked doc" }),
      makeNote({ id: "cal-note", title: "Calendar" }),
    ]);

    await useNoteStore.getState().refreshNotesInPlace("ws1");

    const state = useNoteStore.getState();
    expect(state.notes.map((n) => n.id)).toContain("new-doc");
    expect(state.activeNoteId).toBe("cal-note");
    expect(state.activeCoverImage).toBe("cover-data");
  });

  it("falls back to the first note only when the active note disappeared", async () => {
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "other", title: "Other" })]);

    await useNoteStore.getState().refreshNotesInPlace("ws1");

    expect(useNoteStore.getState().activeNoteId).toBe("other");
  });
});

describe("useNoteStore — fetchNotes staleness guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
    useNoteStore.setState({
      notes: [],
      trashedNotes: [],
      activeNoteId: null,
      activeCoverImage: null,
    });
  });

  it("drops a stale in-flight fetch superseded by a newer one", async () => {
    let resolveWs1: (notes: Note[]) => void = () => {};
    listMetadataByWorkspace.mockImplementation((wsId: string) =>
      wsId === "ws1"
        ? new Promise<Note[]>((r) => {
            resolveWs1 = r;
          })
        : Promise.resolve([makeNote({ id: "ws2-note", workspaceId: "ws2" })]),
    );

    const slow = useNoteStore.getState().fetchNotes("ws1");
    useWorkspaceStore.setState({ activeWorkspaceId: "ws2" });
    const fast = useNoteStore.getState().fetchNotes("ws2");
    await fast;

    expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual(["ws2-note"]);

    resolveWs1([makeNote({ id: "ws1-note", workspaceId: "ws1" })]);
    await slow;

    expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual(["ws2-note"]);
  });

  it("drops a fetch for a workspace the user has since left even when it is the newest", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: "ws2" });
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "stale-ws1", workspaceId: "ws1" })]);

    await useNoteStore.getState().fetchNotes("ws1");

    expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual([]);
  });

  it("does not touch the editor doc registry for a superseded fetch", async () => {
    let resolveWs1: (notes: Note[]) => void = () => {};
    listMetadataByWorkspace.mockImplementation((wsId: string) =>
      wsId === "ws1"
        ? new Promise<Note[]>((r) => {
            resolveWs1 = r;
          })
        : Promise.resolve([makeNote({ id: "ws2-note", workspaceId: "ws2" })]),
    );
    const register = vi.fn();
    const { blockSuiteEditorService } = await import("@/di/container");
    const original = blockSuiteEditorService.registerExistingNotes;
    blockSuiteEditorService.registerExistingNotes = register;

    const slow = useNoteStore.getState().fetchNotes("ws1");
    useWorkspaceStore.setState({ activeWorkspaceId: "ws2" });
    const fast = useNoteStore.getState().fetchNotes("ws2");
    await fast;
    resolveWs1([makeNote({ id: "ws1-note", workspaceId: "ws1" })]);
    await slow;

    blockSuiteEditorService.registerExistingNotes = original;
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith([{ id: "ws2-note", title: "Test" }]);
  });

  it("a local createNote invalidates an in-flight fetch so it cannot erase the new note", async () => {
    let resolveFetch: (notes: Note[]) => void = () => {};
    listMetadataByWorkspace.mockImplementationOnce(
      () =>
        new Promise<Note[]>((r) => {
          resolveFetch = r;
        }),
    );
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "fresh-note", workspaceId: "ws1" })]);
    const { noteService } = await import("@/di/container");
    const originalCreate = noteService.createNote;
    noteService.createNote = vi
      .fn()
      .mockResolvedValue(makeNote({ id: "fresh-note", workspaceId: "ws1" }));

    const inFlight = useNoteStore.getState().fetchNotes("ws1");
    const created = useNoteStore.getState().createNote("ws1", "Fresh");
    await vi.waitFor(() => {
      expect(useNoteStore.getState().notes.map((n) => n.id)).toContain("fresh-note");
    });
    resolveFetch([makeNote({ id: "old-note", workspaceId: "ws1" })]);
    await inFlight;
    await created;

    noteService.createNote = originalCreate;
    expect(useNoteStore.getState().notes.map((n) => n.id)).not.toContain("old-note");
  });

  it("a createNote during a workspace switch re-loads the active workspace's list", async () => {
    listMetadataByWorkspace.mockImplementation((wsId: string) =>
      Promise.resolve(
        wsId === "ws1"
          ? [makeNote({ id: "ws1-note", workspaceId: "ws1" })]
          : [
              makeNote({ id: "ws2-a", workspaceId: "ws2" }),
              makeNote({ id: "ws2-b", workspaceId: "ws2" }),
            ],
      ),
    );
    const { noteService } = await import("@/di/container");
    const originalCreate = noteService.createNote;
    noteService.createNote = vi
      .fn()
      .mockResolvedValue(makeNote({ id: "fresh-ws2", workspaceId: "ws2" }));

    await useNoteStore.getState().fetchNotes("ws1");
    expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual(["ws1-note"]);

    useWorkspaceStore.setState({ activeWorkspaceId: "ws2" });
    await useNoteStore.getState().createNote("ws2", "New");
    await vi.waitFor(() => {
      expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual(["ws2-a", "ws2-b"]);
    });

    noteService.createNote = originalCreate;
  });

  it("a fetch landing inside a trash write window is dropped (no resurrection)", async () => {
    let resolveTrash: () => void = () => {};
    const { noteService } = await import("@/di/container");
    const originalTrash = noteService.trashNote;
    noteService.trashNote = vi.fn().mockReturnValue(
      new Promise<void>((r) => {
        resolveTrash = r;
      }),
    );
    // The in-window fetch still sees the pre-write list; anything after the
    // write commits must not contain the trashed note.
    listMetadataByWorkspace.mockImplementationOnce(() =>
      Promise.resolve([
        makeNote({ id: "doomed", workspaceId: "ws1" }),
        makeNote({ id: "kept", workspaceId: "ws1" }),
      ]),
    );
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "kept", workspaceId: "ws1" })]);
    useNoteStore.setState({
      notes: [makeNote({ id: "doomed" }), makeNote({ id: "kept" })],
    });

    const trash = useNoteStore.getState().trashNote("doomed");
    const fetchInWindow = useNoteStore.getState().fetchNotes("ws1");
    await fetchInWindow;
    resolveTrash();
    await trash;

    noteService.trashNote = originalTrash;
    expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual(["kept"]);
  });

  it("a fetch landing during the vault-lock gap never repopulates the wiped store", async () => {
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "secret", workspaceId: "ws1" })]);
    useNoteStore.setState({ notes: [] });
    handlers.lock?.();

    // The gap: the wipe listener has run and the service reports locked,
    // but the raw crypto service (what NoteService consults) is still live.
    vault.unlocked = true;
    vault.locking = true;
    await useNoteStore.getState().fetchNotes("ws1");
    vault.locking = false;

    expect(useNoteStore.getState().notes).toEqual([]);
  });

  it("a cross-workspace restore does not strand the active workspace's list", async () => {
    listMetadataByWorkspace.mockImplementation((wsId: string) =>
      Promise.resolve([makeNote({ id: `${wsId}-note`, workspaceId: wsId })]),
    );
    await useNoteStore.getState().fetchNotes("ws1");
    useWorkspaceStore.setState({ activeWorkspaceId: "ws2" });

    await useNoteStore.getState().restoreNote("t-other-ws");

    await vi.waitFor(() => {
      expect(useNoteStore.getState().notes.map((n) => n.id)).toEqual(["ws2-note"]);
    });
  });

  it("a refresh dropped by a concurrent write is re-issued after the write drains", async () => {
    listMetadataByWorkspace.mockResolvedValueOnce([makeNote({ id: "n1", workspaceId: "ws1" })]);
    await useNoteStore.getState().fetchNotes("ws1");
    useNoteStore.setState({
      trashedNotes: [makeNote({ id: "t1", workspaceId: "ws1" })],
    });

    let resolveRestoreList: (notes: Note[]) => void = () => {};
    listMetadataByWorkspace.mockImplementationOnce(
      () =>
        new Promise<Note[]>((r) => {
          resolveRestoreList = r;
        }),
    );
    listMetadataByWorkspace.mockResolvedValue([
      makeNote({ id: "n1", workspaceId: "ws1" }),
      makeNote({ id: "t1", workspaceId: "ws1" }),
    ]);
    const restore = useNoteStore.getState().restoreNote("t1");
    await vi.waitFor(() => {
      expect(listMetadataByWorkspace.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    // A concurrent write commits while the restore's refresh is mid-flight.
    updateMetadata.mockResolvedValue(makeNote({ title: "Edited" }));
    await useNoteStore.getState().updateNote("n1", { title: "Edited" });

    // The restore's landing is dropped (writeEpoch moved) — and re-issued.
    resolveRestoreList([makeNote({ id: "t1", workspaceId: "ws1" })]);
    await restore;

    await vi.waitFor(() => {
      expect(useNoteStore.getState().notes.map((n) => n.id)).toContain("t1");
    });
  });
});

describe("useNoteStore — restoreNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
    useNoteStore.setState({
      notes: [makeNote({ id: "n1" })],
      trashedNotes: [makeNote({ id: "t1", workspaceId: "ws1" })],
      activeNoteId: "n1",
      activeCoverImage: null,
    });
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
  });

  it("returns the note to the trash list when the DB restore itself fails", async () => {
    restoreNote.mockRejectedValue(new Error("db down"));

    await useNoteStore.getState().restoreNote("t1");

    expect(useNoteStore.getState().trashedNotes.map((n) => n.id)).toContain("t1");
  });

  it("never re-trashes a live note when only the follow-up refresh fails", async () => {
    restoreNote.mockResolvedValue(undefined);
    listMetadataByWorkspace.mockRejectedValue(new Error("refresh failed"));

    await useNoteStore.getState().restoreNote("t1");

    expect(useNoteStore.getState().trashedNotes.map((n) => n.id)).not.toContain("t1");
  });

  it("refreshes the notes list when the restored note is in the active workspace", async () => {
    restoreNote.mockResolvedValue(undefined);
    listMetadataByWorkspace.mockResolvedValue([makeNote({ id: "t1" }), makeNote({ id: "n1" })]);

    await useNoteStore.getState().restoreNote("t1");

    expect(useNoteStore.getState().notes.map((n) => n.id)).toContain("t1");
  });
});

describe("useNoteStore — doc-created persistence failures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vault.unlocked = true;
  });

  it("rejects when there is no active workspace (no silent ghost doc)", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: null });

    await expect(handlers.docCreated?.("doc-x", "T")).rejects.toThrow();
  });

  it("rejects when the notes row cannot be created", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: "ws1" });
    createNoteWithId.mockRejectedValue(new Error("insert failed"));

    await expect(handlers.docCreated?.("doc-x", "T")).rejects.toThrow("insert failed");
  });
});
