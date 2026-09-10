import { describe, expect, it } from "vitest";
import { evaluateFilters, type FilterableNote } from "@/domain/filters/evaluateFilters";
import type { FilterRule } from "@/domain/filters/FilterRule";
import type { Note } from "@/domain/note/Note";
import type { PropertyValue } from "@/domain/property/Property";

function makeNote(id: string, overrides: Partial<Note> = {}): Note {
  return {
    id,
    workspaceId: "ws",
    title: id,
    content: "",
    isPinned: false,
    isFavorite: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  } as Note;
}

function makeItem(
  id: string,
  opts: {
    propertyValues?: [string, PropertyValue][];
    tagIds?: string[];
    isTemplate?: boolean;
  } = {},
): FilterableNote {
  return {
    note: makeNote(id, { isTemplate: opts.isTemplate }),
    propertyValues: new Map(opts.propertyValues ?? []),
    tagIds: opts.tagIds ?? [],
  };
}

const rid = () => "r";

describe("evaluateFilters", () => {
  it("text rules match contains/is/emptiness", () => {
    const items = [
      makeItem("a", { propertyValues: [["p1", { type: "text", text: "Hello World" }]] }),
      makeItem("b", { propertyValues: [["p1", { type: "text", text: "" }]] }),
      makeItem("c"),
    ];
    const contains: FilterRule = {
      id: rid(),
      kind: "text",
      propertyId: "p1",
      op: "contains",
      value: "world",
    };
    expect(evaluateFilters(items, [contains]).map((i) => i.note.id)).toEqual(["a"]);

    const isRule: FilterRule = {
      id: rid(),
      kind: "text",
      propertyId: "p1",
      op: "is",
      value: "hello world",
    };
    expect(evaluateFilters(items, [isRule]).map((i) => i.note.id)).toEqual(["a"]);

    const empty: FilterRule = { id: rid(), kind: "text", propertyId: "p1", op: "is-empty" };
    expect(evaluateFilters(items, [empty]).map((i) => i.note.id)).toEqual(["b", "c"]);
  });

  it("number rules compare numerically", () => {
    const items = [
      makeItem("a", { propertyValues: [["p", { type: "number", number: 3 }]] }),
      makeItem("b", { propertyValues: [["p", { type: "number", number: 10 }]] }),
      makeItem("c"),
    ];
    const gt: FilterRule = { id: rid(), kind: "number", propertyId: "p", op: ">", value: 5 };
    expect(evaluateFilters(items, [gt]).map((i) => i.note.id)).toEqual(["b"]);

    const eq: FilterRule = { id: rid(), kind: "number", propertyId: "p", op: "=", value: 3 };
    expect(evaluateFilters(items, [eq]).map((i) => i.note.id)).toEqual(["a"]);
  });

  it("date rules compare by calendar day for is", () => {
    const day = new Date(2026, 7, 22, 15, 30).getTime();
    const other = new Date(2026, 7, 21).getTime();
    const items = [
      makeItem("a", { propertyValues: [["p", { type: "date", timestamp: day }]] }),
      makeItem("b", { propertyValues: [["p", { type: "date", timestamp: other }]] }),
    ];
    const rule: FilterRule = {
      id: rid(),
      kind: "date",
      propertyId: "p",
      op: "is",
      value: new Date(2026, 7, 22).getTime(),
    };
    expect(evaluateFilters(items, [rule]).map((i) => i.note.id)).toEqual(["a"]);
  });

  it("select rules match option ids", () => {
    const items = [
      makeItem("a", { propertyValues: [["p", { type: "select", optionId: "o1" }]] }),
      makeItem("b", { propertyValues: [["p", { type: "select", optionId: "o2" }]] }),
      makeItem("c"),
    ];
    const rule: FilterRule = {
      id: rid(),
      kind: "select",
      propertyId: "p",
      op: "is",
      optionIds: ["o1"],
    };
    expect(evaluateFilters(items, [rule]).map((i) => i.note.id)).toEqual(["a"]);
  });

  it("tag rules support any/all/none", () => {
    const items = [
      makeItem("a", { tagIds: ["t1", "t2"] }),
      makeItem("b", { tagIds: ["t1"] }),
      makeItem("c"),
    ];
    const all: FilterRule = { id: rid(), kind: "tags", op: "has-all-of", tagIds: ["t1", "t2"] };
    expect(evaluateFilters(items, [all]).map((i) => i.note.id)).toEqual(["a"]);

    const none: FilterRule = { id: rid(), kind: "tags", op: "has-none-of", tagIds: ["t1"] };
    expect(evaluateFilters(items, [none]).map((i) => i.note.id)).toEqual(["c"]);
  });

  it("template rules check flags", () => {
    const items = [makeItem("a"), makeItem("b", { isTemplate: true }), makeItem("c")];

    const template: FilterRule = { id: rid(), kind: "template", op: "is", value: true };
    expect(evaluateFilters(items, [template]).map((i) => i.note.id)).toEqual(["b"]);
  });

  it("multiple rules AND-combine", () => {
    const items = [
      makeItem("a", {
        tagIds: ["t1"],
        propertyValues: [["p", { type: "checkbox", checked: true }]],
      }),
      makeItem("b", { tagIds: ["t1"] }),
    ];
    const rules: FilterRule[] = [
      { id: rid(), kind: "tags", op: "has-any-of", tagIds: ["t1"] },
      { id: rid(), kind: "checkbox", propertyId: "p", op: "is", value: true },
    ];
    expect(evaluateFilters(items, rules).map((i) => i.note.id)).toEqual(["a"]);
  });

  it("rules without a chosen value are inactive and match everything", () => {
    const items = [makeItem("a"), makeItem("b")];
    const incomplete: FilterRule[] = [
      { id: rid(), kind: "text", propertyId: "p", op: "contains", value: "" },
      { id: rid(), kind: "number", propertyId: "p", op: "=", value: undefined },
      { id: rid(), kind: "date", propertyId: "p", op: "is", value: undefined },
      { id: rid(), kind: "select", propertyId: "p", op: "is", optionIds: [] },
      { id: rid(), kind: "multiSelect", propertyId: "p", op: "is", optionIds: [] },
      { id: rid(), kind: "tags", op: "has-any-of", tagIds: [] },
    ];
    expect(evaluateFilters(items, incomplete).map((i) => i.note.id)).toEqual(["a", "b"]);
  });

  it("an incomplete rule does not mask a complete sibling rule", () => {
    const items = [makeItem("a", { tagIds: ["t1"] }), makeItem("b"), makeItem("c")];
    const rules: FilterRule[] = [
      { id: rid(), kind: "number", propertyId: "p", op: ">", value: undefined },
      { id: rid(), kind: "tags", op: "has-any-of", tagIds: ["t1"] },
    ];
    expect(evaluateFilters(items, rules).map((i) => i.note.id)).toEqual(["a"]);
  });

  it("emptiness operators stay active without a value", () => {
    const items = [
      makeItem("a", { propertyValues: [["p", { type: "number", number: 1 }]] }),
      makeItem("b"),
    ];
    const rule: FilterRule = { id: rid(), kind: "number", propertyId: "p", op: "is-empty" };
    expect(evaluateFilters(items, [rule]).map((i) => i.note.id)).toEqual(["b"]);
  });
});
