import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Note } from "@/domain/note/Note";
import { NoteContextMenu } from "@/features/sidebar/NoteContextMenu";
import { noteActions } from "@/store/noteActions";

vi.mock("@/components/ui/context-menu", () => ({
  ContextMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ContextMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ContextMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div role="menu">{children}</div>
  ),
  ContextMenuItem: ({
    children,
    onSelect,
    className,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
    className?: string;
  }) => (
    <button type="button" role="menuitem" className={className} onClick={() => onSelect?.()}>
      {children}
    </button>
  ),
  ContextMenuSeparator: () => <hr />,
  ContextMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/store/noteActions", () => ({
  noteActions: {
    toggleFavoriteNote: vi.fn(),
    duplicateNote: vi.fn(),
    updateNote: vi.fn(),
    trashNote: vi.fn(),
  },
}));

vi.mock("@/di/container", () => ({
  noteService: {},
  vaultService: { isUnlocked: () => true, onLock: vi.fn() },
  blockSuiteEditorService: { isWorkspaceAlive: () => true },
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

const itemOf = (name: string) => screen.getAllByRole("menuitem", { name }).at(-1);

describe("NoteContextMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs favorite, duplicate and template actions directly from the menu", () => {
    render(
      <NoteContextMenu note={makeNote()}>
        <button type="button">My Note</button>
      </NoteContextMenu>,
    );

    fireEvent.click(itemOf("Favorite Note") ?? screen.getByText("Favorite Note"));
    expect(noteActions.toggleFavoriteNote).toHaveBeenCalledWith("n1");

    fireEvent.click(screen.getByText("Duplicate Note"));
    expect(noteActions.duplicateNote).toHaveBeenCalledWith("n1");

    fireEvent.click(screen.getByText("Use as template"));
    expect(noteActions.updateNote).toHaveBeenCalledWith("n1", { isTemplate: true });
  });

  it("labels favorite and template entries by the note's current flags", () => {
    render(
      <NoteContextMenu note={makeNote({ isFavorite: true })}>
        <button type="button">My Note</button>
      </NoteContextMenu>,
    );

    expect(screen.queryByText("Favorite Note")).not.toBeInTheDocument();
    expect(screen.getByText("Unfavorite Note")).toBeInTheDocument();
    expect(screen.getByText("Use as template")).toBeInTheDocument();
  });

  it("offers the template workflow on template rows", () => {
    render(
      <NoteContextMenu note={makeNote({ isTemplate: true })} variant="template">
        <button type="button">My Note</button>
      </NoteContextMenu>,
    );

    fireEvent.click(screen.getByText("New note from template"));
    expect(noteActions.duplicateNote).toHaveBeenCalledWith("n1");

    fireEvent.click(screen.getByText("Remove template flag"));
    expect(noteActions.updateNote).toHaveBeenCalledWith("n1", { isTemplate: false });
  });

  it("asks for confirmation before trashing from the menu", () => {
    render(
      <NoteContextMenu note={makeNote()}>
        <button type="button">My Note</button>
      </NoteContextMenu>,
    );

    fireEvent.click(screen.getByText("Move to Trash"));
    expect(noteActions.trashNote).not.toHaveBeenCalled();

    const confirm = screen.getAllByRole("button", { name: "Move to Trash" }).at(-1);
    fireEvent.click(confirm ?? screen.getByText("Move to Trash"));
    expect(noteActions.trashNote).toHaveBeenCalledWith("n1");
  });
});
