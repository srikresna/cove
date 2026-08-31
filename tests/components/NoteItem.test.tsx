import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Note } from "@/domain/note/Note";
import { NoteItem } from "@/features/sidebar/NoteItem";
import { useNoteUiStore } from "@/store/useNoteUiStore";

vi.mock("@/di/container", () => ({
  noteService: {},
  vaultService: {
    isUnlocked: () => true,
    onLock: vi.fn(),
  },
  blockSuiteEditorService: {
    isWorkspaceAlive: () => true,
    registerExistingNotes: vi.fn(),
  },
}));

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "n1",
    workspaceId: "ws1",
    title: "My Note",
    content: "",
    createdAt: 0,
    updatedAt: 0,
    isPinned: false,
    isFavorite: false,
    ...overrides,
  } as Note;
}

const baseProps = {
  onTogglePin: vi.fn(),
  onToggleFavorite: vi.fn(),
  onDuplicate: vi.fn(),
  onDelete: vi.fn(),
};

describe("NoteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNoteUiStore.setState({ activeNoteId: null, activeCoverImage: null });
  });

  // The row and its hover "..." menu button both match /My Note/ — scope to
  // the row by its exact accessible name.
  const rowOf = (note: Note) =>
    screen.getByRole("button", { name: `Note: ${note.title || "Untitled"}` });

  it("renders the title and announces the row as a note button", () => {
    const note = makeNote();
    render(<NoteItem note={note} isActive={false} onSelect={vi.fn()} {...baseProps} />);
    expect(rowOf(note)).toBeInTheDocument();
  });

  it("a plain click opens the note (no selection toggle)", () => {
    const onSelect = vi.fn();
    const note = makeNote();
    render(<NoteItem note={note} isActive={false} onSelect={onSelect} {...baseProps} />);
    fireEvent.click(rowOf(note));
    expect(onSelect).toHaveBeenCalledWith("n1", expect.anything());
  });

  it("ctrl-click reaches the handler with the modifier intact", () => {
    const onSelect = vi.fn();
    const note = makeNote();
    render(<NoteItem note={note} isActive={false} onSelect={onSelect} {...baseProps} />);
    fireEvent.click(rowOf(note), { ctrlKey: true });
    // The event reaches the handler; LibraryNoteList decides what it means.
    expect(onSelect).toHaveBeenCalledWith("n1", expect.objectContaining({ ctrlKey: true }));
  });

  it("shows up to three stack rows and the tag chips passed in", () => {
    render(
      <NoteItem
        note={makeNote()}
        isActive={false}
        onSelect={vi.fn()}
        stackRows={[
          {
            def: {
              id: "p1",
              name: "Status",
              type: "select",
              options: [],
              createdAt: 0,
              order: "",
              show: "always-show",
              icon: null,
            } as never,
            value: { type: "text", text: "v1" },
          },
          {
            def: {
              id: "p2",
              name: "Effort",
              type: "number",
              options: [],
              createdAt: 0,
              order: "",
              show: "always-show",
              icon: null,
            } as never,
            value: { type: "number", number: 3 },
          },
        ]}
        tagChips={[{ name: "work", color: "#f00" }]}
        {...baseProps}
      />,
    );
    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
  });
});
