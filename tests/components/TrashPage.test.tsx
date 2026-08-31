import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Note } from "@/domain/note/Note";
import { TrashPage } from "@/features/trash/TrashPage";
import { noteActions } from "@/store/noteActions";
import { queryClient as appClient, trashKey } from "@/store/queryClient";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

const listTrash = vi.hoisted(() => vi.fn());

vi.mock("@/di/container", () => ({
  noteService: { listTrash },
  vaultService: { isUnlocked: () => true, onLock: vi.fn() },
  blockSuiteEditorService: { isWorkspaceAlive: () => true },
}));

vi.mock("@/store/noteActions", () => ({
  noteActions: {
    restoreNote: vi.fn(),
    deleteNotePermanently: vi.fn(),
  },
}));

function makeNote(id: string, title: string, ws: string): Note {
  return {
    id,
    workspaceId: ws,
    title,
    content: "",
    createdAt: 0,
    updatedAt: 0,
    isPinned: false,
    isFavorite: false,
    deletedAt: 123,
  } as Note;
}

describe("TrashPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appClient.clear();
    useWorkspaceStore.setState({
      workspaces: [
        { id: "ws1", name: "Work", emoji: "📝", color: "#111", createdAt: 0 },
        { id: "ws2", name: "Home", emoji: "🏠", color: "#222", createdAt: 1 },
      ] as never,
      activeWorkspaceId: "ws1",
    });
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={appClient}>
        <TooltipProvider>
          <TrashPage />
        </TooltipProvider>
      </QueryClientProvider>,
    );

  it("lists trashed notes from all workspaces with their workspace name", async () => {
    listTrash.mockResolvedValue([
      makeNote("t1", "Quarterly report", "ws1"),
      makeNote("t2", "Groceries", "ws2"),
    ]);
    appClient.setQueryData(trashKey, [
      makeNote("t1", "Quarterly report", "ws1"),
      makeNote("t2", "Groceries", "ws2"),
    ]);

    renderPage();

    expect(await screen.findByText("Quarterly report")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText(/Work/)).toBeInTheDocument();
    expect(screen.getByText(/Home/)).toBeInTheDocument();
  });

  it("restore forwards the note id", async () => {
    appClient.setQueryData(trashKey, [makeNote("t1", "Quarterly report", "ws1")]);
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: /^restore$/i }));
    expect(noteActions.restoreNote).toHaveBeenCalledWith("t1");
  });

  it("empty trash state", () => {
    appClient.setQueryData(trashKey, []);
    renderPage();
    expect(screen.getByText(/trash is empty/i)).toBeInTheDocument();
  });
});
