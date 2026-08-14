import { beforeEach, describe, expect, it, vi } from "vitest";

const { togglePin, toggleFavorite, updateNote } = vi.hoisted(() => ({
  togglePin: vi.fn<(id: string) => Promise<void>>(),
  toggleFavorite: vi.fn<(id: string) => Promise<void>>(),
  updateNote: vi.fn<(id: string, updates: Record<string, unknown>) => Promise<void>>(),
}));

vi.mock("@/di/container", () => ({
  noteService: { togglePin, toggleFavorite, updateNote },
  vaultService: { isUnlocked: () => true, onLock: () => {} },
  blockSuiteEditorService: {
    isWorkspaceAlive: () => true,
    registerPendingFlusher: () => () => {},
    provideDocCreatedHandler: () => {},
    provideCanvasPrefs: () => {},
    getViewSpecs: () => [],
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
