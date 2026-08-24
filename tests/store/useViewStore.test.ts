import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedView } from "@/domain/filters/SavedView";

const { listViews, notifyError } = vi.hoisted(() => ({
  listViews: vi.fn<(workspaceId: string) => Promise<SavedView[]>>(),
  notifyError: vi.fn<(err: unknown) => void>(),
}));

vi.mock("@/di/container", () => ({
  savedViewService: { listViews },
  vaultService: { onLock: vi.fn() },
}));

vi.mock("@/store/notify", () => ({ notifyError }));

import { useViewStore } from "@/store/useViewStore";

function makeView(id: string, workspaceId = "ws1"): SavedView {
  return { id, workspaceId, name: id, rules: [], createdAt: 1 };
}

describe("useViewStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useViewStore.setState({ views: [], activeViewId: null, draftRules: [], version: 0 });
  });

  it("fetchViews clears a selection whose view vanished from the fresh list", async () => {
    useViewStore.setState({
      views: [makeView("doomed"), makeView("kept")],
      activeViewId: "doomed",
      draftRules: [{ id: "r1", kind: "tags", op: "has-any-of", tagIds: ["t1"] }],
    });
    listViews.mockResolvedValue([makeView("kept")]);

    await useViewStore.getState().fetchViews("ws1");

    expect(useViewStore.getState().views.map((v) => v.id)).toEqual(["kept"]);
    expect(useViewStore.getState().activeViewId).toBeNull();
    expect(useViewStore.getState().draftRules).toEqual([]);
  });

  it("fetchViews keeps an active selection that is still present", async () => {
    useViewStore.setState({ activeViewId: "kept" });
    listViews.mockResolvedValue([makeView("kept")]);

    await useViewStore.getState().fetchViews("ws1");

    expect(useViewStore.getState().activeViewId).toBe("kept");
  });

  it("healDrafts drops dead-def rules, trims dead option ids, keeps propertyless kinds", () => {
    useViewStore.setState({
      draftRules: [
        { id: "r1", kind: "date", propertyId: "pDead", op: "is", value: 123 },
        { id: "r2", kind: "select", propertyId: "pLive", op: "is", optionIds: ["live", "dead"] },
        { id: "r3", kind: "checkbox", propertyId: "pLive", op: "is", value: true },
        { id: "r4", kind: "tags", op: "has-any-of", tagIds: ["t1"] },
        // Loader-stamped tags rule (propertyId "" on a loaded view's copy).
        {
          id: "r5",
          kind: "journal",
          op: "is",
          value: true,
          propertyId: "",
          optionIds: [],
          tagIds: [],
        },
      ],
    });

    useViewStore.getState().healDrafts([
      {
        id: "pLive",
        name: "Live",
        type: "select",
        options: [
          { id: "live", name: "Live", color: "#000" },
          { id: "other", name: "Other", color: "#111" },
        ],
        createdAt: 0,
        order: "a0",
        show: "always-show",
        icon: null,
      },
    ]);

    expect(useViewStore.getState().draftRules).toEqual([
      { id: "r2", kind: "select", propertyId: "pLive", op: "is", optionIds: ["live"] },
      { id: "r3", kind: "checkbox", propertyId: "pLive", op: "is", value: true },
      { id: "r4", kind: "tags", op: "has-any-of", tagIds: ["t1"] },
      {
        id: "r5",
        kind: "journal",
        op: "is",
        value: true,
        propertyId: "",
        optionIds: [],
        tagIds: [],
      },
    ]);
  });

  it("healDrafts drops select rules emptied by dead option ids", () => {
    useViewStore.setState({
      draftRules: [
        { id: "r1", kind: "multiSelect", propertyId: "pLive", op: "is", optionIds: ["dead1"] },
      ],
    });

    useViewStore.getState().healDrafts([
      {
        id: "pLive",
        name: "Live",
        type: "multiSelect",
        options: [{ id: "live", name: "Live", color: "#000" }],
        createdAt: 0,
        order: "a0",
        show: "always-show",
        icon: null,
      },
    ]);

    expect(useViewStore.getState().draftRules).toEqual([]);
  });
});
