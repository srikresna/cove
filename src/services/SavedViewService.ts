import { NotFoundError } from "../domain/errors";
import type { FilterRule, FilterRules } from "../domain/filters/FilterRule";
import { isRuleComplete } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import { makeSavedViewId } from "../domain/filters/SavedView";
import type { PropertyDefinition } from "../domain/property/Property";
import { ValidationError } from "../errors/AppError";
import type { ISavedViewRepository } from "../repositories/ISavedViewRepository";
import type { ISavedViewService } from "./ISavedViewService";

function normalizeViewName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Semantics of a rule in the POST-deletion universe (its property/option
 * gone, so no note can carry the referenced value): negative operators are
 * vacuously true for every note, positive operators match nothing.
 */
function droppedRuleMatchesAllPostDelete(rule: FilterRule): boolean {
  switch (rule.kind) {
    case "select":
    case "multiSelect":
      return rule.op === "is-not";
    case "tags":
      return rule.op === "has-none-of" || rule.op === "has-all-of";
    case "text":
      return rule.op === "is-not";
    default:
      return false;
  }
}

/** The rule kinds whose filter references a property definition. */
function ruleHasPropertyId(rule: FilterRule): rule is Extract<FilterRule, { propertyId: string }> {
  return (
    rule.kind === "text" ||
    rule.kind === "number" ||
    rule.kind === "date" ||
    rule.kind === "select" ||
    rule.kind === "multiSelect" ||
    rule.kind === "checkbox"
  );
}

/**
 * Rewrite outcome for one rule inside applyViewPrune: the replacement rule
 * (or the drop reason, used for the keep-vs-delete classification).
 */
type RuleRewrite = { drop: false; rule: FilterRule } | { drop: true; postDeleteMatchAll: boolean };

export class SavedViewService implements ISavedViewService {
  constructor(private readonly views: ISavedViewRepository) {}

  listViews(workspaceId: string): Promise<SavedView[]> {
    return this.views.listByWorkspace(workspaceId);
  }

  async createView(workspaceId: string, name: string, rules: FilterRules): Promise<SavedView> {
    const normalized = normalizeViewName(name);
    if (!normalized) throw new ValidationError("View name cannot be empty.");
    if (rules.length === 0) throw new ValidationError("A view needs at least one rule.");
    // A view whose every rule is incomplete evaluates to match-all (the
    // gate treats value-less rules as inactive), which is never what the
    // user meant when they hit Save — refuse it up front.
    if (rules.filter(isRuleComplete).length === 0) {
      throw new ValidationError("Pick a value for at least one rule before saving.");
    }

    const existing = await this.views.listByWorkspace(workspaceId);
    if (existing.some((v) => v.name.toLowerCase() === normalized.toLowerCase())) {
      throw new ValidationError("A view with this name already exists.");
    }

    const view: SavedView = {
      id: makeSavedViewId(),
      workspaceId,
      name: normalized,
      rules,
      createdAt: Date.now(),
    };
    await this.views.create(view);
    return view;
  }

  async renameView(id: string, name: string): Promise<void> {
    const normalized = normalizeViewName(name);
    if (!normalized) throw new ValidationError("View name cannot be empty.");
    const view = await this.views.findById(id);
    if (!view) throw new NotFoundError("SavedView", id);
    // Same uniqueness rule as createView, scoped to the view's workspace.
    const existing = await this.views.listByWorkspace(view.workspaceId);
    if (existing.some((v) => v.id !== id && v.name.toLowerCase() === normalized.toLowerCase())) {
      throw new ValidationError("A view with this name already exists.");
    }
    await this.views.rename(id, normalized);
  }

  deleteView(id: string): Promise<void> {
    return this.views.delete(id);
  }

  /**
   * Shared prune engine: rewriteRule maps each rule to its replacement or a
   * drop (classified by its post-deletion match semantics). Computes every
   * view's outcome FIRST, then applies all rewrites + deletions in ONE
   * transaction, so an interrupted prune can never land on some views but
   * not others. Returns the deleted view ids.
   *
   * Keep-vs-delete when no complete rule survives: the view's fate follows
   * the rules that were ACTIVE before the prune. If every active rule is
   * vacuously match-all in the post-deletion universe (negative operators),
   * the view has been showing everything all along and is kept with `[]`
   * rules (identical match-all under the completeness gate). Otherwise the
   * view filtered something real that no note can carry anymore and is
   * deleted. Inactive (incomplete) rules were already no-ops and never
   * influence the decision. Surviving views are persisted with only their
   * complete rules — the shape createView accepts.
   */
  private async applyViewPrune(rewriteRule: (rule: FilterRule) => RuleRewrite): Promise<string[]> {
    const updates: Array<{ id: string; rulesJson: string }> = [];
    const deletes: string[] = [];
    for (const view of await this.views.listAll()) {
      let changed = false;
      let wasMatchAllBeforePrune = true;
      const kept: FilterRules = [];
      for (const rule of view.rules) {
        const outcome = rewriteRule(rule);
        if (outcome.drop) {
          changed = true;
          // Only pre-prune ACTIVE rules shaped the view's behavior.
          if (isRuleComplete(rule) && !outcome.postDeleteMatchAll) {
            wasMatchAllBeforePrune = false;
          }
          continue;
        }
        if (outcome.rule !== rule) changed = true;
        kept.push(outcome.rule);
      }
      if (!changed) continue;
      const complete = kept.filter(isRuleComplete);
      if (complete.length > 0) {
        updates.push({ id: view.id, rulesJson: JSON.stringify(complete) });
      } else if (wasMatchAllBeforePrune) {
        updates.push({ id: view.id, rulesJson: "[]" });
      } else {
        deletes.push(view.id);
      }
    }
    await this.views.applyPrune(updates, deletes);
    return deletes;
  }

  /**
   * Removes a deleted select/multiSelect option from every saved view's
   * rules (property defs are global, so views in all workspaces can
   * reference them). Rules left with no option under a value-requiring op
   * are dropped; views left with no complete rule are handled per the
   * applyViewPrune policy. Returns the deleted view ids.
   */
  pruneOption(definitionId: string, optionId: string): Promise<string[]> {
    return this.applyViewPrune((rule) => {
      if (
        (rule.kind === "select" || rule.kind === "multiSelect") &&
        rule.propertyId === definitionId &&
        rule.optionIds.includes(optionId)
      ) {
        const optionIds = rule.optionIds.filter((id) => id !== optionId);
        if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) {
          return { drop: true, postDeleteMatchAll: rule.op === "is-not" };
        }
        return { drop: false, rule: { ...rule, optionIds } };
      }
      return { drop: false, rule };
    });
  }

  /**
   * Removes every rule referencing a deleted property definition (any
   * kind), with the same view lifecycle policy as pruneOption. Returns the
   * deleted view ids.
   */
  pruneProperty(definitionId: string): Promise<string[]> {
    return this.applyViewPrune((rule) => {
      if (ruleHasPropertyId(rule) && rule.propertyId === definitionId) {
        return { drop: true, postDeleteMatchAll: droppedRuleMatchesAllPostDelete(rule) };
      }
      return { drop: false, rule };
    });
  }

  /**
   * Startup self-heal: drops saved-view rules referencing property defs or
   * option ids that no longer exist (stranded by an interrupted prune or by
   * deletions from older builds). Idempotent; rewrites land in one
   * transaction.
   *
   * Kinds are narrowed explicitly: the SQLite loader stamps EVERY decoded
   * rule with a propertyId key (defaulting to ""), so `in`-checks are
   * meaningless on loaded rules — tags/journal/template rules carry no
   * property and must pass through untouched.
   */
  async healRules(liveDefs: PropertyDefinition[]): Promise<void> {
    const liveDefIds = new Set(liveDefs.map((d) => d.id));
    const liveOptions = new Map<string, Set<string>>(
      liveDefs.map((d) => [d.id, new Set(d.options.map((o) => o.id))]),
    );
    await this.applyViewPrune((rule) => {
      if (!ruleHasPropertyId(rule)) return { drop: false, rule };
      if (!liveDefIds.has(rule.propertyId)) {
        return { drop: true, postDeleteMatchAll: droppedRuleMatchesAllPostDelete(rule) };
      }
      if (rule.kind === "select" || rule.kind === "multiSelect") {
        const live = liveOptions.get(rule.propertyId) ?? new Set<string>();
        const optionIds = rule.optionIds.filter((id) => live.has(id));
        if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) {
          return { drop: true, postDeleteMatchAll: rule.op === "is-not" };
        }
        if (optionIds.length !== rule.optionIds.length) {
          return { drop: false, rule: { ...rule, optionIds } };
        }
      }
      return { drop: false, rule };
    });
  }
}
