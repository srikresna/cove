import type { PropertyDefinition } from "../property/Property";
import { matchesEmptyInputs } from "./evaluateFilters";
import type { FilterRule } from "./FilterRule";

export type RuleRewrite = { drop: false; rule: FilterRule } | { drop: true; vacuouslyAll: boolean };

type ValueRule = Extract<FilterRule, { propertyId: string }>;

const isValueRule = (rule: FilterRule): rule is ValueRule =>
  rule.kind === "text" ||
  rule.kind === "number" ||
  rule.kind === "date" ||
  rule.kind === "select" ||
  rule.kind === "multiSelect" ||
  rule.kind === "checkbox";

export function removeOption(
  rule: FilterRule,
  definitionId: string,
  optionId: string,
): RuleRewrite {
  if (
    (rule.kind === "select" || rule.kind === "multiSelect") &&
    rule.propertyId === definitionId &&
    rule.optionIds.includes(optionId)
  ) {
    const optionIds = rule.optionIds.filter((id) => id !== optionId);
    if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) {
      return { drop: true, vacuouslyAll: rule.op === "is-not" };
    }
    return { drop: false, rule: { ...rule, optionIds } };
  }
  return { drop: false, rule };
}

export function dropDeadDef(rule: FilterRule, definitionId: string): RuleRewrite {
  if (isValueRule(rule) && rule.propertyId === definitionId) {
    return { drop: true, vacuouslyAll: matchesEmptyInputs(rule) };
  }
  return { drop: false, rule };
}

export function healRule(
  rule: FilterRule,
  defs: PropertyDefinition[],
  opts: { emptySelectIsComposing?: boolean } = {},
): RuleRewrite {
  if (!isValueRule(rule)) return { drop: false, rule };
  const def = defs.find((d) => d.id === rule.propertyId);
  if (!def) return dropDeadDef(rule, rule.propertyId);
  if (rule.kind === "select" || rule.kind === "multiSelect") {
    const live = new Set(def.options.map((o) => o.id));
    const optionIds = rule.optionIds.filter((id) => live.has(id));
    if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) {
      if (opts.emptySelectIsComposing && rule.optionIds.length === 0) {
        return { drop: false, rule };
      }
      return { drop: true, vacuouslyAll: rule.op === "is-not" };
    }
    if (optionIds.length !== rule.optionIds.length) {
      return { drop: false, rule: { ...rule, optionIds } };
    }
  }
  return { drop: false, rule };
}
