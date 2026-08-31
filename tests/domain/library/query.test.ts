import { describe, expect, it } from "vitest";
import {
  decidesByFabricatedEmptiness,
  type FilterableNote,
  matchesEmptyInputs,
} from "@/domain/filters/evaluateFilters";
import type { FilterRule } from "@/domain/filters/FilterRule";
import { compareBy, isStackEligibleDef, selectNotesForView } from "@/domain/library/query";
import type { Note } from "@/domain/note/Note";
import type { PropertyDefinition } from "@/domain/property/Property";

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

const item = (
  n: Note,
  values: Map<string, unknown> = new Map(),
  tags: string[] = [],
): FilterableNote =>
  ({
    note: n,
    propertyValues: values as FilterableNote["propertyValues"],
    tagIds: tags,
    journalTimestamp: null,
  }) as FilterableNote;

const rule = (r: Partial<FilterRule>): FilterRule => r as FilterRule;

describe("matchesEmptyInputs (derived from the evaluator)", () => {
  it("agrees with the evaluator's empty-input behavior on every op class", () => {
    expect(matchesEmptyInputs(rule({ kind: "text", op: "is-empty", value: undefined }))).toBe(true);
    // The unified twin: `is-not` is satisfied by emptiness too (no value ≠ needle).
    expect(matchesEmptyInputs(rule({ kind: "text", op: "is-not", value: "x" }))).toBe(true);
    expect(matchesEmptyInputs(rule({ kind: "text", op: "contains", value: "x" }))).toBe(false);
    expect(matchesEmptyInputs(rule({ kind: "number", op: "is-empty" }))).toBe(true);
    expect(matchesEmptyInputs(rule({ kind: "select", op: "is-not", optionIds: ["o1"] }))).toBe(
      true,
    );
    expect(matchesEmptyInputs(rule({ kind: "checkbox", value: false }))).toBe(true);
    expect(matchesEmptyInputs(rule({ kind: "checkbox", value: true }))).toBe(false);
    expect(matchesEmptyInputs(rule({ kind: "tags", op: "has-none-of", tagIds: ["t1"] }))).toBe(
      true,
    );
    expect(matchesEmptyInputs(rule({ kind: "tags", op: "is-empty" }))).toBe(true);
    expect(matchesEmptyInputs(rule({ kind: "journal", value: false }))).toBe(true);
  });

  it("template rules read live note fields, so fabricated emptiness decides nothing", () => {
    expect(decidesByFabricatedEmptiness(rule({ kind: "template", value: false }))).toBe(false);
    expect(matchesEmptyInputs(rule({ kind: "template", value: false }))).toBe(true);
  });
});

describe("selectNotesForView", () => {
  const a = note("a");
  const b = note("b");
  const c = note("c");
  const withValue = (n: Note, text: string): FilterableNote =>
    item(n, new Map([["p1", { type: "text", text }]]));
  const isNotEmptyRule = rule({ kind: "text", propertyId: "p1", op: "is-not-empty" });

  it("defers cache-unknown notes only for emptiness-deciding rules", () => {
    const filterable = new Map<string, FilterableNote>([["a", withValue(a, "v")]]);
    const out = selectNotesForView(
      {
        notes: [a, b, c],
        rules: [isNotEmptyRule],
        filterable,
        allowNoteIds: [],
      },
      "updated-desc",
    );
    // is-not-empty is NOT emptiness-admitting, so nothing defers: b evaluates
    // with synthesized empty inputs and fails; c (provably empty) fails too.
    expect(out.map((n) => n.id)).toEqual(["a"]);
  });

  it("an emptiness-admitting rule defers unknown notes until the cache loads", () => {
    const isEmpty = rule({ kind: "text", propertyId: "p1", op: "is-empty" });
    const filterable = new Map<string, FilterableNote>([["a", withValue(a, "v")]]);
    const out = selectNotesForView(
      { notes: [a, b], rules: [isEmpty], filterable, allowNoteIds: [] },
      "updated-desc",
    );
    // is-empty admits emptiness -> b (cache-absent) is deferred out.
    expect(out.map((n) => n.id)).toEqual([]);
  });

  it("synthesizedPreview evaluates rules even without a cache (never all-notes)", () => {
    const isEmpty = rule({ kind: "text", propertyId: "p1", op: "is-empty" });
    const filterable = new Map<string, FilterableNote>([["a", withValue(a, "v")]]);
    const out = selectNotesForView(
      { notes: [a, b], rules: [isEmpty], filterable, allowNoteIds: [] },
      "updated-desc",
      { synthesizedPreview: true },
    );
    // No deferral in preview mode: a fails is-empty, b evaluates synthesized
    // empty and matches.
    expect(out.map((n) => n.id)).toEqual(["b"]);
  });

  it("synthesizedPreview with a NULL cache still applies the rules", () => {
    const contains = rule({ kind: "text", propertyId: "p1", op: "contains", value: "x" });
    const out = selectNotesForView(
      {
        notes: [a, b],
        rules: [contains],
        filterable: new Map<string, FilterableNote>([["a", withValue(a, "xylophone")]]),
        allowNoteIds: [],
      },
      "updated-desc",
      { synthesizedPreview: true },
    );
    expect(out.map((n) => n.id)).toEqual(["a"]);
  });

  it("without a cache and without the preview flag, notes pass until the loader runs", () => {
    const contains = rule({ kind: "text", propertyId: "p1", op: "contains", value: "x" });
    const out = selectNotesForView(
      {
        notes: [a, b],
        rules: [contains],
        filterable: null,
        allowNoteIds: [],
      },
      "updated-desc",
    );
    expect(out.map((n) => n.id)).toEqual(["a", "b"]);
  });

  it("positive rules evaluate unknown notes with synthesized empty inputs (no deferral)", () => {
    // Shipped policy: only fabricated-ADMITTING rules defer unknowns — a
    // positive rule simply excludes an empty-input note.
    const contains = rule({ kind: "text", propertyId: "p1", op: "contains", value: "x" });
    const filterable = new Map<string, FilterableNote>([["a", withValue(a, "xylophone")]]);
    const out = selectNotesForView(
      { notes: [a, b], rules: [contains], filterable, allowNoteIds: [] },
      "updated-desc",
    );
    expect(out.map((n) => n.id)).toEqual(["a"]);
  });

  it("OR-unions the manual allow-list into the rule-matched set", () => {
    const filterable = new Map<string, FilterableNote>([["a", withValue(a, "v")]]);
    const out = selectNotesForView(
      {
        notes: [a, b, c],
        rules: [isNotEmptyRule],
        filterable,
        allowNoteIds: ["c"],
      },
      "updated-desc",
    );
    expect(out.map((n) => n.id)).toEqual(["a", "c"]);
  });

  it("custom sort orders by fractional key with createdAt tiebreak", () => {
    const x = note("x", { orderIndex: "a0", createdAt: 5 });
    const y = note("y", { orderIndex: "a1", createdAt: 1 });
    const z = note("z", { createdAt: 99 });
    const out = selectNotesForView(
      { notes: [z, y, x], rules: [], filterable: null, allowNoteIds: [] },
      "custom",
    );
    // Empty keys sort last, keyed notes in fractional order.
    expect(out.map((n) => n.id)).toEqual(["x", "y", "z"]);
    expect(compareBy("custom")(x, y)).toBeLessThan(0);
  });
});

describe("isStackEligibleDef", () => {
  const def = (over: Partial<PropertyDefinition>): PropertyDefinition =>
    ({
      id: "p1",
      name: "P",
      type: "text",
      options: [],
      createdAt: 1,
      order: "",
      show: "always-show",
      icon: null,
      ...over,
    }) as PropertyDefinition;

  it("admits simple-typed, visible custom defs", () => {
    expect(isStackEligibleDef(def({}))).toBe(true);
    expect(isStackEligibleDef(def({ type: "multiSelect" }))).toBe(true);
  });

  it("rejects hidden defs and system defs and relation-like types", () => {
    expect(isStackEligibleDef(def({ show: "always-hide" }))).toBe(false);
    expect(isStackEligibleDef(def({ id: "system:tags" }))).toBe(false);
    expect(isStackEligibleDef(def({ type: "relation" }))).toBe(false);
  });
});
