import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  togglePin,
  toggleFavorite,
  updateContent,
  updateMetadata,
  createNoteWithId,
  listMetadataByWorkspace,
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
  invalidateNoteBacklinkScan: vi.fn<(noteId: string) => void>(),
  clearBacklinkScans: vi.fn<() => void>(),
  setDocTitle: vi.fn<(docId: string, title: string) => void>(),
  vault: { unlocked: true },
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
  },
  vaultService: {
    isUnlocked: () => vault.unlocked,
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
