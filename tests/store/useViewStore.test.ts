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

  it("healDrafts keeps freshly-added empty select rules (mid-composition)", () => {
    useViewStore.setState({
      draftRules: [
        // FilterBar's "+ Filter" creates exactly this shape before the
        // user picks an option — it is inactive, not stranded.
        { id: "r1", kind: "select", propertyId: "pLive", op: "is", optionIds: [] },
      ],
    });

    useViewStore.getState().healDrafts([
      {
        id: "pLive",
        name: "Live",
        type: "select",
        options: [{ id: "live", name: "Live", color: "#000" }],
        createdAt: 0,
        order: "a0",
        show: "always-show",
        icon: null,
      },
    ]);

    expect(useViewStore.getState().draftRules).toHaveLength(1);
  });

  it("a superseded fetch is dropped entirely and cannot clear a later selection", async () => {
    // Stale fetch for workspace A is slow; a fetch for B dispatches and
    // resolves first; the user then re-applies a view; the stale fetch
    // lands last — it must be dropped, not applied.
    let releaseStale: (views: SavedView[]) => void = () => {};
    const stalePromise = new Promise<SavedView[]>((resolve) => {
      releaseStale = resolve;
    });
    let call = 0;
    listViews.mockImplementation(() => {
      call += 1;
      return call === 1 ? stalePromise : Promise.resolve([makeView("vb", "wsB")]);
    });

    const staleFetch = useViewStore.getState().fetchViews("wsA");
    await useViewStore.getState().fetchViews("wsB");
    useViewStore.setState({ activeViewId: "vb", draftRules: [], appliedRulesSnapshot: "[]" });

    releaseStale([makeView("va", "wsA")]);
    await staleFetch;

    expect(useViewStore.getState().views.map((v) => v.id)).toEqual(["vb"]);
    expect(useViewStore.getState().activeViewId).toBe("vb");
  });

  it("an untouched applied view whose fresh rules differ gets its drafts re-copied", async () => {
    const staleRules = [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["dead"] },
    ];
    const healedRules = [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: [] as string[] },
    ];
    useViewStore.setState({
      views: [{ id: "v1", workspaceId: "ws1", name: "v1", rules: staleRules, createdAt: 1 }],
      activeViewId: "v1",
      // Simulates a straggler click on a stale row: drafts hold pre-heal
      // rules and the snapshot matches them (user hasn't tweaked anything).
      draftRules: staleRules.map((r) => ({ ...r })),
      appliedRulesSnapshot: JSON.stringify(staleRules),
    });
    listViews.mockResolvedValue([
      { id: "v1", workspaceId: "ws1", name: "v1", rules: healedRules, createdAt: 1 },
    ]);

    await useViewStore.getState().fetchViews("ws1");

    expect(useViewStore.getState().draftRules).toEqual(healedRules);
  });

  it("user-tweaked drafts are never overwritten by a fetch", async () => {
    const applied = [{ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["live"] }];
    const tweaked = [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["other"] },
    ];
    // The DB rules ALSO changed after the apply (e.g. an option was deleted
    // and the view pruned) — the re-copy quadrant that matters.
    const pruned = [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: [] as string[] },
    ];
    useViewStore.setState({
      activeViewId: "v1",
      draftRules: tweaked.map((r) => ({ ...r })),
      appliedRulesSnapshot: JSON.stringify(applied),
    });
    listViews.mockResolvedValue([
      {
        id: "v1",
        workspaceId: "ws1",
        name: "v1",
        rules: pruned.map((r) => ({ ...r })),
        createdAt: 1,
      },
    ]);

    await useViewStore.getState().fetchViews("ws1");

    expect(useViewStore.getState().draftRules).toEqual(tweaked);
  });

  it("untouched drafts ARE re-copied when the view's rules changed", async () => {
    const applied = [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["todo", "doing"] },
    ];
    const pruned = [{ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["todo"] }];
    useViewStore.setState({
      activeViewId: "v1",
      draftRules: applied.map((r) => ({ ...r })),
      appliedRulesSnapshot: JSON.stringify(applied),
    });
    listViews.mockResolvedValue([
      {
        id: "v1",
        workspaceId: "ws1",
        name: "v1",
        rules: pruned.map((r) => ({ ...r })),
        createdAt: 1,
      },
    ]);

    await useViewStore.getState().fetchViews("ws1");

    expect(useViewStore.getState().draftRules).toEqual(pruned);
  });
});
