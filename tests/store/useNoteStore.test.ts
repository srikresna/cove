import { beforeEach, describe, expect, it, vi } from "vitest";

const { togglePin, toggleFavorite, updateNote, listMetadataByWorkspace } = vi.hoisted(() => ({
  togglePin: vi.fn<(id: string) => Promise<void>>(),
  toggleFavorite: vi.fn<(id: string) => Promise<void>>(),
  updateNote: vi.fn<(id: string, updates: Record<string, unknown>) => Promise<void>>(),
  listMetadataByWorkspace: vi.fn<(wsId: string) => Promise<Note[]>>(),
}));

vi.mock("@/di/container", () => ({
  noteService: { togglePin, toggleFavorite, updateNote, listMetadataByWorkspace },
  vaultService: { isUnlocked: () => true, onLock: () => {} },
  blockSuiteEditorService: {
    isWorkspaceAlive: () => true,
    registerPendingFlusher: () => () => {},
    provideDocCreatedHandler: () => {},
    setDocTitle: () => {},
    provideCanvasPrefs: () => {},
    getViewSpecs: () => [],
    registerExistingNotes: () => {},
  },
}));

import type { Note } from "@/domain/note/Note";
import { useNoteStore } from "@/store/useNoteStore";

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

describe("useNoteStore — refreshNotesInPlace (peek-created docs)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
