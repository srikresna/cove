import { describe, expect, it } from "vitest";
import { groupNotes } from "@/domain/library/grouping";
import type { Note } from "@/domain/note/Note";
import type { PropertyValue } from "@/domain/property/Property";
import type { Tag } from "@/domain/tag/Tag";

const note = (id: string, overrides: Partial<Note> = {}): Note =>
  ({
    id,
    workspaceId: "ws1",
    title: id,
    content: "",
    createdAt: 10,
    updatedAt: 20,
    isPinned: false,
    isFavorite: false,
    ...overrides,
  }) as Note;

const tag = (id: string, name: string): Tag =>
  ({ id, name, workspaceId: "ws1", color: "#f00", createdAt: 1 }) as Tag;

const emptyInputs = {
  allTags: [] as Tag[],
  tagIdsByNote: null,
  journalByNoteId: new Map<string, number | null>(),
  stackValues: null,
  stackDefs: [],
  defs: [],
};

describe("groupNotes", () => {
  it("puts a multi-tag note under EACH tag and untagged notes in one bucket", () => {
    const groups = groupNotes({
      ...emptyInputs,
      groupBy: "tags",
      notes: [note("a"), note("b"), note("c")],
      allTags: [tag("t1", "Work"), tag("t2", "Home")],
      tagIdsByNote: new Map([
        ["a", ["t1", "t2"]],
        ["b", ["t2"]],
      ]),
    });
    expect(groups.map((g) => [g.key, g.notes.map((n) => n.id)]).sort()).toEqual(
      [
        ["tag:t1", ["a"]],
        ["tag:t2", ["a", "b"]],
        ["__untagged__", ["c"]],
      ].sort(),
    );
    // The Untagged meta bucket sorts last.
    expect(groups[groups.length - 1]?.key).toBe("__untagged__");
  });

  it("buckets created/updated by CALENDAR DAY, newest day first", () => {
    const sameDay = new Date(2026, 7, 30, 9, 0).getTime();
    const laterSameDay = new Date(2026, 7, 30, 23, 0).getTime();
    const earlierDay = new Date(2026, 7, 28, 12, 0).getTime();
    const groups = groupNotes({
      ...emptyInputs,
      groupBy: "created",
      notes: [
        note("early", { createdAt: earlierDay }),
        note("m1", { createdAt: sameDay }),
        note("m2", { createdAt: laterSameDay }),
      ],
    });
    expect(groups).toHaveLength(2);
    expect(groups[0]?.notes.map((n) => n.id).sort()).toEqual(["m1", "m2"]);
    expect(groups[1]?.notes.map((n) => n.id)).toEqual(["early"]);
  });

  it("separates an explicitly-set unchecked checkbox from an empty value", () => {
    const def = {
      id: "p1",
      name: "Done",
      type: "checkbox",
      options: [],
      createdAt: 1,
      order: "",
      show: "always-show",
      icon: null,
    } as never;
    const groups = groupNotes({
      ...emptyInputs,
      groupBy: { defId: "p1" },
      notes: [note("none"), note("unchecked"), note("checked")],
      stackDefs: [def],
      stackValues: new Map<string, Map<string, PropertyValue>>([
        ["unchecked", new Map([["p1", { type: "checkbox", checked: false }]])],
        ["checked", new Map([["p1", { type: "checkbox", checked: true }]])],
      ]),
    });
    expect(groups.map((g) => g.key)).toEqual(["p:✓", "p:__unchecked__", "p:__empty__"]);
  });

  it("falls back to a single All-notes bucket for a missing def", () => {
    const groups = groupNotes({
      ...emptyInputs,
      groupBy: { defId: "gone" },
      notes: [note("a"), note("b")],
    });
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("All notes");
  });
});
