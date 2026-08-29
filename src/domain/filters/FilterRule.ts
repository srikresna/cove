import type { PropertyDefinition, PropertyType } from "../property/Property";

/**
 * Filter AST for note views: a list of rules combined with AND;
 * tags participate as their own rule kind.
 */

export type TextFilterOp = "contains" | "is" | "is-not" | "is-empty" | "is-not-empty";
export type NumberFilterOp = "=" | "≠" | "<" | ">" | "≤" | "≥" | "is-empty" | "is-not-empty";
export type DateFilterOp = "is" | "before" | "after" | "is-empty" | "is-not-empty";
export type SelectFilterOp = "is" | "is-not" | "is-empty" | "is-not-empty";
export type CheckboxFilterOp = "is";
export type TagFilterOp = "has-any-of" | "has-all-of" | "has-none-of" | "is-empty" | "is-not-empty";

export interface FilterRuleBase {
  readonly id: string;
}

export interface TextFilterRule extends FilterRuleBase {
  readonly kind: "text";
  readonly propertyId: string;
  readonly op: TextFilterOp;
  readonly value?: string;
}

export interface NumberFilterRule extends FilterRuleBase {
  readonly kind: "number";
  readonly propertyId: string;
  readonly op: NumberFilterOp;
  readonly value?: number;
}

export interface DateFilterRule extends FilterRuleBase {
  readonly kind: "date";
  readonly propertyId: string;
  readonly op: DateFilterOp;
  /** Local-midnight timestamp for is/before/after. */
  readonly value?: number;
}

export interface SelectFilterRule extends FilterRuleBase {
  readonly kind: "select";
  readonly propertyId: string;
  readonly op: SelectFilterOp;
  /** Option ids (single value for is/is-not, ignored for emptiness ops). */
  readonly optionIds: string[];
}

export interface CheckboxFilterRule extends FilterRuleBase {
  readonly kind: "checkbox";
  readonly propertyId: string;
  readonly op: CheckboxFilterOp;
  readonly value: boolean;
}

export interface MultiSelectFilterRule extends FilterRuleBase {
  readonly kind: "multiSelect";
  readonly propertyId: string;
  readonly op: SelectFilterOp;
  readonly optionIds: string[];
}

export interface TagFilterRule extends FilterRuleBase {
  readonly kind: "tags";
  readonly op: TagFilterOp;
  /** Tag ids. */
  readonly tagIds: string[];
}

export interface JournalFilterRule extends FilterRuleBase {
  readonly kind: "journal";
  readonly op: "is" | "is-not";
  readonly value: boolean;
}

export interface TemplateFilterRule extends FilterRuleBase {
  readonly kind: "template";
  readonly op: "is" | "is-not";
  readonly value: boolean;
}

export type FilterRule =
  | TextFilterRule
  | NumberFilterRule
  | DateFilterRule
  | SelectFilterRule
  | MultiSelectFilterRule
  | CheckboxFilterRule
  | TagFilterRule
  | JournalFilterRule
  | TemplateFilterRule;

export type FilterRules = FilterRule[];

/** Per-type selectable operators, used to build the filter UI. */
export const FILTER_OPERATORS: Record<
  FilterRule["kind"],
  ReadonlyArray<{ value: string; label: string }>
> = {
  text: [
    { value: "contains", label: "contains" },
    { value: "is", label: "is" },
    { value: "is-not", label: "is not" },
    { value: "is-empty", label: "is empty" },
    { value: "is-not-empty", label: "is not empty" },
  ],
  number: [
    { value: "=", label: "=" },
    { value: "≠", label: "≠" },
    { value: "<", label: "<" },
    { value: ">", label: ">" },
    { value: "≤", label: "≤" },
    { value: "≥", label: "≥" },
    { value: "is-empty", label: "is empty" },
    { value: "is-not-empty", label: "is not empty" },
  ],
  date: [
    { value: "is", label: "is" },
    { value: "before", label: "before" },
    { value: "after", label: "after" },
    { value: "is-empty", label: "is empty" },
    { value: "is-not-empty", label: "is not empty" },
  ],
  select: [
    { value: "is", label: "is" },
    { value: "is-not", label: "is not" },
    { value: "is-empty", label: "is empty" },
    { value: "is-not-empty", label: "is not empty" },
  ],
  multiSelect: [
    { value: "is", label: "is any of" },
    { value: "is-not", label: "is not" },
    { value: "is-empty", label: "is empty" },
    { value: "is-not-empty", label: "is not empty" },
  ],
  checkbox: [{ value: "is", label: "is" }],
  tags: [
    { value: "has-any-of", label: "has any of" },
    { value: "has-all-of", label: "has all of" },
    { value: "has-none-of", label: "has none of" },
    { value: "is-empty", label: "is empty" },
    { value: "is-not-empty", label: "is not empty" },
  ],
  journal: [
    { value: "is", label: "is" },
    { value: "is-not", label: "is not" },
  ],
  template: [
    { value: "is", label: "is" },
    { value: "is-not", label: "is not" },
  ],
};

/** The filter kind a property definition contributes. */
export function filterKindForType(type: PropertyType): FilterRule["kind"] | null {
  switch (type) {
    case "text":
    case "person":
    case "url":
      return "text";
    case "number":
      return "number";
    case "date":
      return "date";
    case "select":
    case "status":
      return "select";
    case "multiSelect":
      return "multiSelect";
    case "checkbox":
      return "checkbox";
    default:
      return null;
  }
}

export function isFilterKind(value: string): value is FilterRule["kind"] {
  return value in FILTER_OPERATORS;
}

/**
 * A rule whose value has not been chosen yet is incomplete — treated as
 * inactive (matches everything), not blanking the list. Emptiness ops need no value.
 */
export function isRuleComplete(rule: FilterRule): boolean {
  const emptiness = rule.op === "is-empty" || rule.op === "is-not-empty";
  switch (rule.kind) {
    case "text":
      return emptiness || (rule.value ?? "") !== "";
    case "number":
    case "date":
      return emptiness || rule.value != null;
    case "select":
    case "multiSelect":
      return emptiness || rule.optionIds.length > 0;
    case "tags":
      return emptiness || rule.tagIds.length > 0;
    default:
      return true;
  }
}

export type { PropertyDefinition };
