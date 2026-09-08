import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Workspace } from "@/domain/workspace/Workspace";

const {
  getAllWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  collectWorkspaceBlobCandidates,
  gcOrphanBlobs,
  notifyError,
} = vi.hoisted(() => ({
  getAllWorkspaces: vi.fn<() => Promise<Workspace[]>>(),
  createWorkspace:
    vi.fn<
      (name: string, emoji: string, color: string, description?: string) => Promise<Workspace>
    >(),
  updateWorkspace: vi.fn<(id: string, updates: Partial<Workspace>) => Promise<Workspace>>(),
  deleteWorkspace: vi.fn<(id: string) => Promise<void>>(),
  collectWorkspaceBlobCandidates: vi.fn<(workspaceId: string) => Promise<string[]>>(),
  gcOrphanBlobs: vi.fn<(candidates: string[]) => Promise<void>>(),
  notifyError: vi.fn<(err: unknown) => void>(),
}));

vi.mock("@/di/container", () => ({
  workspaceService: { getAllWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace },
  noteService: { collectWorkspaceBlobCandidates, gcOrphanBlobs },
  tagService: {},
  savedViewService: {},
  vaultService: { onLock: vi.fn() },
}));

vi.mock("@/store/notify", () => ({ notifyError }));

import { useTagStore } from "@/store/useTagStore";
import { useUIStore } from "@/store/useUIStore";
import { useViewStore } from "@/store/useViewStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

function makeWorkspace(id: string, overrides: Partial<Workspace> = {}): Workspace {
  return {
    id,
    name: id,
    emoji: "🚀",
    color: "#0e7c66",
    description: null,
    createdAt: 1,
    ...overrides,
  } as Workspace;
}

describe("useWorkspaceStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWorkspaceStore.setState({ workspaces: [], activeWorkspaceId: null });
    useUIStore.setState({ isCreateModalOpen: false });
  });

  it("fetchWorkspaces falls back to the first workspace when none is active", async () => {
    getAllWorkspaces.mockResolvedValue([makeWorkspace("w1"), makeWorkspace("w2")]);

    await useWorkspaceStore.getState().fetchWorkspaces();

    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("w1");
  });

  it("fetchWorkspaces preserves an active id that still exists", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: "w2" });
    getAllWorkspaces.mockResolvedValue([makeWorkspace("w1"), makeWorkspace("w2")]);

    await useWorkspaceStore.getState().fetchWorkspaces();

    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("w2");
  });

  it("fetchWorkspaces replaces a vanished active id with the first workspace", async () => {
    useWorkspaceStore.setState({ activeWorkspaceId: "gone" });
    getAllWorkspaces.mockResolvedValue([makeWorkspace("w1")]);

    await useWorkspaceStore.getState().fetchWorkspaces();

    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("w1");
  });

  it("fetchWorkspaces reports failures through notifyError", async () => {
    getAllWorkspaces.mockRejectedValue(new Error("db down"));

    await useWorkspaceStore.getState().fetchWorkspaces();

    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it("createWorkspace appends, activates, and closes the create modal", async () => {
    const created = makeWorkspace("w9", { name: "New" });
    createWorkspace.mockResolvedValue(created);
    useUIStore.setState({ isCreateModalOpen: true });

    const result = await useWorkspaceStore
      .getState()
      .createWorkspace("New", "🚀", "#fff", undefined);

    expect(result?.id).toBe("w9");
    expect(useWorkspaceStore.getState().workspaces.at(-1)?.id).toBe("w9");
    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("w9");
    expect(useUIStore.getState().isCreateModalOpen).toBe(false);
  });

  it("createWorkspace resets the previous workspace's tag/view filters", async () => {
    const created = makeWorkspace("w9", { name: "New" });
    createWorkspace.mockResolvedValue(created);
    useWorkspaceStore.setState({
      workspaces: [makeWorkspace("w1")],
      activeWorkspaceId: "w1",
    });
    useTagStore.setState({ activeTagId: "t1", taggedNoteIds: new Set(["n1"]) });
    useViewStore.setState({
      activeViewId: "v1",
      draftRules: [{ id: "r1", kind: "tags", op: "has-any-of", tagIds: ["t1"] }],
    });

    await useWorkspaceStore.getState().createWorkspace("New", "🚀", "#fff", undefined);

    expect(useTagStore.getState().activeTagId).toBeNull();
    expect(useTagStore.getState().taggedNoteIds).toBeNull();
    expect(useViewStore.getState().activeViewId).toBeNull();
    expect(useViewStore.getState().draftRules).toEqual([]);
  });

  it("createWorkspace returns null on failure", async () => {
    createWorkspace.mockRejectedValue(new Error("nope"));

    const result = await useWorkspaceStore.getState().createWorkspace("X", "🚀", "#fff");

    expect(result).toBeNull();
    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it("updateWorkspace applies optimistically and rolls back on failure", async () => {
    useWorkspaceStore.setState({ workspaces: [makeWorkspace("w1", { name: "Old" })] });
    updateWorkspace.mockRejectedValue(new Error("db down"));

    await useWorkspaceStore.getState().updateWorkspace("w1", { name: "New" } as Partial<Workspace>);

    expect(useWorkspaceStore.getState().workspaces[0]?.name).toBe("Old");
    expect(notifyError).toHaveBeenCalledTimes(1);
  });

  it("deleteWorkspace removes and activates the next remaining workspace", async () => {
    useWorkspaceStore.setState({
      workspaces: [makeWorkspace("w1"), makeWorkspace("w2")],
      activeWorkspaceId: "w1",
    });
    deleteWorkspace.mockResolvedValue(undefined);
    collectWorkspaceBlobCandidates.mockResolvedValue([]);

    await useWorkspaceStore.getState().deleteWorkspace("w1");

    expect(useWorkspaceStore.getState().workspaces.map((w) => w.id)).toEqual(["w2"]);
    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("w2");
  });

  it("deleteWorkspace collects blob candidates first, deletes, then GCs orphans", async () => {
    useWorkspaceStore.setState({
      workspaces: [makeWorkspace("w1"), makeWorkspace("w2")],
      activeWorkspaceId: "w1",
    });
    const order: string[] = [];
    collectWorkspaceBlobCandidates.mockImplementation(async () => {
      order.push("collect");
      return ["blob-1"];
    });
    deleteWorkspace.mockImplementation(async () => {
      order.push("delete");
    });
    gcOrphanBlobs.mockImplementation(async () => {
      order.push("gc");
    });

    await useWorkspaceStore.getState().deleteWorkspace("w1");

    expect(order).toEqual(["collect", "delete", "gc"]);
    expect(collectWorkspaceBlobCandidates).toHaveBeenCalledWith("w1");
  });

  it("switching workspaces resets tag filters and saved-view rules", () => {
    useWorkspaceStore.setState({
      workspaces: [makeWorkspace("w1"), makeWorkspace("w2")],
      activeWorkspaceId: "w1",
    });
    useTagStore.setState({
      activeTagId: "tag-from-w1",
      taggedNoteIds: new Set(["n1"]),
    });
    useViewStore.setState({
      activeViewId: "view-from-w1",
      draftRules: [{ id: "r1", kind: "tags", op: "has-any-of", tagIds: ["tag-from-w1"] }],
    });

    useWorkspaceStore.getState().setActiveWorkspace("w2");

    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe("w2");
    expect(useTagStore.getState().activeTagId).toBeNull();
    expect(useTagStore.getState().taggedNoteIds).toBeNull();
    expect(useViewStore.getState().activeViewId).toBeNull();
    expect(useViewStore.getState().draftRules).toEqual([]);
  });

  it("re-selecting the active workspace keeps filters intact", () => {
    useWorkspaceStore.setState({
      workspaces: [makeWorkspace("w1"), makeWorkspace("w2")],
      activeWorkspaceId: "w1",
    });
    useTagStore.setState({ activeTagId: "t1", taggedNoteIds: new Set(["n1"]) });

    useWorkspaceStore.getState().setActiveWorkspace("w1");

    expect(useTagStore.getState().activeTagId).toBe("t1");
  });
});
