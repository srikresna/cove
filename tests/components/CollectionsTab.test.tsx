import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/di/container", () => ({
  savedViewService: { listViews: vi.fn() },
  vaultService: { onLock: vi.fn() },
}));

import type { SavedView } from "@/domain/filters/SavedView";
import { CollectionsTab } from "@/features/library/CollectionsTab";
import { useViewStore } from "@/store/useViewStore";

const view: SavedView = {
  id: "v1",
  workspaceId: "ws1",
  name: "Journal entries",
  rules: [],
  allowNoteIds: [],
  createdAt: 0,
};

describe("CollectionsTab", () => {
  beforeEach(() => {
    useViewStore.setState({ views: [view], activeViewId: null });
  });

  it("renders the saved collection rows", () => {
    render(<CollectionsTab onOpenInDocs={vi.fn()} onEditView={vi.fn()} onCreateView={vi.fn()} />);
    expect(screen.getByText("Journal entries")).toBeInTheDocument();
  });

  it("applies a row and hands off to Docs", () => {
    const onOpenInDocs = vi.fn();
    render(
      <CollectionsTab onOpenInDocs={onOpenInDocs} onEditView={vi.fn()} onCreateView={vi.fn()} />,
    );
    fireEvent.click(screen.getByText("Journal entries"));
    expect(useViewStore.getState().activeViewId).toBe("v1");
    expect(onOpenInDocs).toHaveBeenCalledTimes(1);
  });

  it("edit-rules jumps to the filter bar, not a modal", async () => {
    const onEditView = vi.fn();
    render(
      <CollectionsTab onOpenInDocs={vi.fn()} onEditView={onEditView} onCreateView={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /journal entries: collections/i }));
    fireEvent.click(await screen.findByText("Edit rules"));
    expect(onEditView).toHaveBeenCalledWith("v1");
  });

  it("new collection opens an empty builder via the create handoff", () => {
    const onCreateView = vi.fn();
    render(
      <CollectionsTab onOpenInDocs={vi.fn()} onEditView={vi.fn()} onCreateView={onCreateView} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /new collection/i }));
    expect(onCreateView).toHaveBeenCalledTimes(1);
  });

  it("empty state CTA also goes through the create handoff", () => {
    useViewStore.setState({ views: [] });
    const onCreateView = vi.fn();
    render(
      <CollectionsTab onOpenInDocs={vi.fn()} onEditView={vi.fn()} onCreateView={onCreateView} />,
    );
    const buttons = screen.getAllByRole("button", { name: /new collection/i });
    const cta = buttons[buttons.length - 1];
    if (!cta) throw new Error("empty-state CTA missing");
    fireEvent.click(cta);
    expect(onCreateView).toHaveBeenCalledTimes(1);
  });
});
