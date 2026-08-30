import type { PropertyDefinition } from "../property/Property";
import { matchesEmptyInputs } from "./evaluateFilters";
import type { FilterRule } from "./FilterRule";

/** Rewrite outcome for one rule: the replacement, or the drop (with whether
 *  the dropped rule was vacuously satisfied by EVERY note post-deletion —
 *  used to decide keep-as-match-all vs delete the whole view). */
export type RuleRewrite = { drop: false; rule: FilterRule } | { drop: true; vacuouslyAll: boolean };

/** The rule kinds whose filter references a property definition. */
type ValueRule = Extract<FilterRule, { propertyId: string }>;

const isValueRule = (rule: FilterRule): rule is ValueRule =>
  rule.kind === "text" ||
  rule.kind === "number" ||
  rule.kind === "date" ||
  rule.kind === "select" ||
  rule.kind === "multiSelect" ||
  rule.kind === "checkbox";

/** Removes a deleted option from a select/multiSelect rule (defs are global
 *  across workspaces). A rule left with no options drops: `is-not` was
 *  vacuously true, `is` matched nothing. */
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

/** Every rule referencing a dead def drops; `vacuouslyAll` mirrors the
 *  evaluator's empty-input behavior (a deleted def is empty on every note). */
export function dropDeadDef(rule: FilterRule, definitionId: string): RuleRewrite {
  if (isValueRule(rule) && rule.propertyId === definitionId) {
    return { drop: true, vacuouslyAll: matchesEmptyInputs(rule) };
  }
  return { drop: false, rule };
}

/**
 * Startup self-heal against live defs and options. Kinds are narrowed
 * explicitly because the SQLite loader stamps every decoded rule with a
 * propertyId — `in`-checks are meaningless on loaded rules.
 *
 * `emptySelectIsComposing` keeps an ALREADY-empty select rule (drafts sit in
 * that state mid-composition); persisted rules never do, so the service
 * prunes them.
 */
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
