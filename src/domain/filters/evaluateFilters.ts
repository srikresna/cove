import type { Note } from "../note/Note";
import type { PropertyValue } from "../property/Property";
import type { FilterRule } from "./FilterRule";
import { isRuleComplete } from "./FilterRule";

export interface FilterableNote {
  note: Note;
  propertyValues: Map<string, PropertyValue>;
  tagIds: string[];
  journalTimestamp: number | null;
}

const sameCalendarDay = (a: number, b: number): boolean => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

function matchText(
  rule: Extract<FilterRule, { kind: "text" }>,
  value: PropertyValue | undefined,
): boolean {
  const text =
    value?.type === "text"
      ? value.text
      : value?.type === "person"
        ? value.name
        : value?.type === "url"
          ? value.url
          : null;
  const needle = (rule.value ?? "").toLowerCase();
  switch (rule.op) {
    case "contains":
      return text?.toLowerCase().includes(needle) ?? false;
    case "is":
      return text != null && text.toLowerCase() === needle;
    case "is-not":
      return text == null || text.toLowerCase() !== needle;
    case "is-empty":
      return text == null || text.length === 0;
    case "is-not-empty":
      return text != null && text.length > 0;
  }
}

function matchNumber(
  rule: Extract<FilterRule, { kind: "number" }>,
  value: PropertyValue | undefined,
): boolean {
  const num = value?.type === "number" ? value.number : null;
  const target = rule.value;
  if (rule.op === "is-empty") return num == null;
  if (rule.op === "is-not-empty") return num != null;
  if (num == null || target == null) return false;
  switch (rule.op) {
    case "=":
      return num === target;
    case "≠":
      return num !== target;
    case "<":
      return num < target;
    case ">":
      return num > target;
    case "≤":
      return num <= target;
    case "≥":
      return num >= target;
  }
}

function matchDate(
  rule: Extract<FilterRule, { kind: "date" }>,
  value: PropertyValue | undefined,
): boolean {
  const ts = value?.type === "date" ? value.timestamp : null;
  if (rule.op === "is-empty") return ts == null;
  if (rule.op === "is-not-empty") return ts != null;
  if (ts == null || rule.value == null) return false;
  switch (rule.op) {
    case "is":
      return sameCalendarDay(ts, rule.value);
    case "before":
      return ts < rule.value;
    case "after":
      return ts > rule.value;
  }
}

function matchSelect(
  rule: Extract<FilterRule, { kind: "select" }>,
  value: PropertyValue | undefined,
): boolean {
  const optionId = value?.type === "select" || value?.type === "status" ? value.optionId : null;
  if (rule.op === "is-empty") return optionId == null;
  if (rule.op === "is-not-empty") return optionId != null;
  if (rule.op === "is") return optionId != null && rule.optionIds.includes(optionId);
  return optionId == null || !rule.optionIds.includes(optionId);
}

function matchMultiSelect(
  rule: Extract<FilterRule, { kind: "multiSelect" }>,
  value: PropertyValue | undefined,
): boolean {
  const ids = value?.type === "multiSelect" ? value.optionIds : [];
  if (rule.op === "is-empty") return ids.length === 0;
  if (rule.op === "is-not-empty") return ids.length > 0;
  if (rule.op === "is") return ids.some((id) => rule.optionIds.includes(id));
  return !ids.some((id) => rule.optionIds.includes(id));
}

function matchCheckbox(
  rule: Extract<FilterRule, { kind: "checkbox" }>,
  value: PropertyValue | undefined,
): boolean {
  const checked = value?.type === "checkbox" && value.checked;
  return checked === rule.value;
}

function matchRule(rule: FilterRule, item: FilterableNote): boolean {
  switch (rule.kind) {
    case "text":
      return matchText(rule, item.propertyValues.get(rule.propertyId));
    case "number":
      return matchNumber(rule, item.propertyValues.get(rule.propertyId));
    case "date":
      return matchDate(rule, item.propertyValues.get(rule.propertyId));
    case "select":
      return matchSelect(rule, item.propertyValues.get(rule.propertyId));
    case "multiSelect":
      return matchMultiSelect(rule, item.propertyValues.get(rule.propertyId));
    case "checkbox":
      return matchCheckbox(rule, item.propertyValues.get(rule.propertyId));
    case "tags": {
      const ids = item.tagIds;
      switch (rule.op) {
        case "has-any-of":
          return rule.tagIds.some((t) => ids.includes(t));
        case "has-all-of":
          return rule.tagIds.every((t) => ids.includes(t));
        case "has-none-of":
          return !rule.tagIds.some((t) => ids.includes(t));
        case "is-empty":
          return ids.length === 0;
        case "is-not-empty":
          return ids.length > 0;
      }
      return true;
    }
    case "journal":
      return rule.value === (item.journalTimestamp != null);
    case "template":
      return rule.value === (item.note.isTemplate === true);
  }
}

export function evaluateFilters(items: FilterableNote[], rules: FilterRule[]): FilterableNote[] {
  if (rules.length === 0) return items;
  const active = rules.filter(isRuleComplete);
  if (active.length === 0) return items;
  return items.filter((item) => active.every((rule) => matchRule(rule, item)));
}

const emptyInputs = (): FilterableNote => ({
  note: { isTemplate: false } as unknown as Note,
  propertyValues: new Map(),
  tagIds: [],
  journalTimestamp: null,
});

export function matchesEmptyInputs(rule: FilterRule): boolean {
  return matchRule(rule, emptyInputs());
}

export function decidesByFabricatedEmptiness(rule: FilterRule): boolean {
  return rule.kind !== "template" && matchesEmptyInputs(rule);
}
