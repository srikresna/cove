import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Tag } from "@/domain/tag/Tag";

const { listTags, notesForTag, notifyError, onLockHandlers } = vi.hoisted(() => ({
  listTags: vi.fn<() => Promise<Tag[]>>(),
  notesForTag: vi.fn<(tagId: string) => Promise<string[]>>(),
  notifyError: vi.fn<(err: unknown) => void>(),
  onLockHandlers: { lock: null as (() => void) | null },
}));

vi.mock("@/di/container", () => ({
  tagService: { listTags, notesForTag },
  vaultService: {
    onLock: (fn: () => void) => {
      onLockHandlers.lock = fn;
    },
  },
}));

vi.mock("@/store/notify", () => ({ notifyError }));

import { useTagStore } from "@/store/useTagStore";

function makeTag(id: string): Tag {
  return { id, name: id, color: "#000000", createdAt: 1 } as Tag;
}

describe("useTagStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTagStore.setState({ tags: [], activeTagId: null, version: 0, taggedNoteIds: null });
  });

  it("fetchTags populates the tag list", async () => {
    listTags.mockResolvedValue([makeTag("t1"), makeTag("t2")]);

    await useTagStore.getState().fetchTags();

    expect(useTagStore.getState().tags).toHaveLength(2);
  });

  it("fetchTags reports failures through notifyError", async () => {
    listTags.mockRejectedValue(new Error("db down"));

    await useTagStore.getState().fetchTags();

    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(useTagStore.getState().tags).toEqual([]);
  });

  it("setTagFilter clears synchronously for null and for re-clicking the active tag", async () => {
    useTagStore.setState({ activeTagId: "t1", taggedNoteIds: new Set(["n1"]) });

    await useTagStore.getState().setTagFilter(null);
    expect(useTagStore.getState().activeTagId).toBeNull();
    expect(useTagStore.getState().taggedNoteIds).toBeNull();

    useTagStore.setState({ activeTagId: "t1", taggedNoteIds: new Set(["n1"]) });
    await useTagStore.getState().setTagFilter("t1");
    expect(useTagStore.getState().activeTagId).toBeNull();
  });

  it("setTagFilter sets the active tag optimistically, then the note set", async () => {
    notesForTag.mockResolvedValue(["n1", "n2"]);

    const pending = useTagStore.getState().setTagFilter("t1");
    expect(useTagStore.getState().activeTagId).toBe("t1");

    await pending;
    expect(useTagStore.getState().taggedNoteIds).toEqual(new Set(["n1", "n2"]));
  });

  it("a slower stale response cannot overwrite a newer selection", async () => {
    let resolveA: (ids: string[]) => void = () => {};
    notesForTag.mockImplementation((tagId) =>
      tagId === "a"
        ? new Promise<string[]>((r) => {
            resolveA = r;
          })
        : Promise.resolve(["nb"]),
    );

    const a = useTagStore.getState().setTagFilter("a");
    const b = useTagStore.getState().setTagFilter("b");
    await b;
    resolveA(["na"]);
    await a;

    expect(useTagStore.getState().activeTagId).toBe("b");
    expect(useTagStore.getState().taggedNoteIds).toEqual(new Set(["nb"]));
  });

  it("refresh bumps the version and refreshes the active filter", async () => {
    useTagStore.setState({ activeTagId: "t1", version: 3 });
    listTags.mockResolvedValue([makeTag("t1")]);
    notesForTag.mockResolvedValue(["n9"]);

    await useTagStore.getState().refresh();

    expect(useTagStore.getState().version).toBe(4);
    expect(useTagStore.getState().taggedNoteIds).toEqual(new Set(["n9"]));
  });

  it("vault lock clears tags and the filter", () => {
    useTagStore.setState({
      tags: [makeTag("t1")],
      activeTagId: "t1",
      taggedNoteIds: new Set(["n"]),
    });

    onLockHandlers.lock?.();

    expect(useTagStore.getState().tags).toEqual([]);
    expect(useTagStore.getState().activeTagId).toBeNull();
    expect(useTagStore.getState().taggedNoteIds).toBeNull();
  });
});
