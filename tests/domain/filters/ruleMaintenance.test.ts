import { describe, expect, it } from "vitest";
import type { FilterRule } from "@/domain/filters/FilterRule";
import { dropDeadDef, healRule, removeOption } from "@/domain/filters/ruleMaintenance";
import type { PropertyDefinition } from "@/domain/property/Property";

const rule = (r: Partial<FilterRule>): FilterRule => r as FilterRule;
const def = (over: Partial<PropertyDefinition>): PropertyDefinition =>
  ({
    id: "p1",
    name: "P",
    type: "select",
    options: [
      { id: "o1", name: "One", color: "#111" },
      { id: "o2", name: "Two", color: "#222" },
    ],
    createdAt: 1,
    order: "",
    show: "always-show",
    icon: null,
    ...over,
  }) as PropertyDefinition;

describe("removeOption", () => {
  it("prunes the id and drops a left-empty is-rule as non-vacuous", () => {
    const r = rule({ kind: "select", propertyId: "p1", op: "is", optionIds: ["o1"] });
    expect(removeOption(r, "p1", "o1")).toEqual({ drop: true, vacuouslyAll: false });
  });

  it("a left-empty is-not rule is vacuously true post-deletion", () => {
    const r = rule({ kind: "select", propertyId: "p1", op: "is-not", optionIds: ["o1"] });
    expect(removeOption(r, "p1", "o1")).toEqual({ drop: true, vacuouslyAll: true });
  });

  it("rewrites multi-option rules in place and ignores other defs", () => {
    const r = rule({ kind: "multiSelect", propertyId: "p1", op: "is", optionIds: ["o1", "o2"] });
    expect(removeOption(r, "p1", "o1")).toEqual({
      drop: false,
      rule: rule({ kind: "multiSelect", propertyId: "p1", op: "is", optionIds: ["o2"] }),
    });
    expect(removeOption(r, "other", "o1")).toEqual({ drop: false, rule: r });
  });
});

describe("dropDeadDef", () => {
  it("classifies vacuity from the evaluator's empty-input behavior", () => {
    expect(
      dropDeadDef(rule({ kind: "text", propertyId: "p1", op: "is-not", value: "x" }), "p1"),
    ).toEqual({
      drop: true,
      vacuouslyAll: true,
    });
    expect(
      dropDeadDef(rule({ kind: "text", propertyId: "p1", op: "contains", value: "x" }), "p1"),
    ).toEqual({
      drop: true,
      vacuouslyAll: false,
    });
    expect(dropDeadDef(rule({ kind: "tags", op: "is-empty" }), "p1")).toEqual({
      drop: false,
      rule: rule({ kind: "tags", op: "is-empty" }),
    });
  });
});

describe("healRule", () => {
  it("drops rules whose def is gone and prunes dead option ids", () => {
    const dead = rule({ kind: "text", propertyId: "gone", op: "is-empty" });
    expect(healRule(dead, [def({})])).toEqual({ drop: true, vacuouslyAll: true });

    const stale = rule({ kind: "select", propertyId: "p1", op: "is", optionIds: ["o1", "dead"] });
    expect(healRule(stale, [def({})])).toEqual({
      drop: false,
      rule: rule({ kind: "select", propertyId: "p1", op: "is", optionIds: ["o1"] }),
    });
  });

  it("passes through tags/journal/template rules (loader stamps propertyId on them)", () => {
    const tagged = rule({ kind: "tags", op: "has-none-of", tagIds: ["t"] });
    expect(healRule(tagged, [])).toEqual({ drop: false, rule: tagged });
  });

  it("emptySelectIsComposing keeps an ALREADY-empty select (draft mid-composition)", () => {
    const empty = rule({ kind: "select", propertyId: "p1", op: "is", optionIds: [] });
    expect(healRule(empty, [def({})], { emptySelectIsComposing: true })).toEqual({
      drop: false,
      rule: empty,
    });
    expect(healRule(empty, [def({})])).toEqual({ drop: true, vacuouslyAll: false });
  });
});
