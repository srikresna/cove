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
 * A value-less rule with a NEGATIVE operator matched EVERYTHING under the
 * old strict evaluator (is-not [] is true for every note), unlike positive
 * ops which matched nothing. Views emptied down to such rules must keep
 * their match-all behavior, not be deleted.
 */
function ruleWasVacuousMatchAll(rule: FilterRule): boolean {
  switch (rule.kind) {
    case "select":
    case "multiSelect":
      return rule.op === "is-not" && rule.optionIds.length === 0;
    case "tags":
      return (rule.op === "has-none-of" || rule.op === "has-all-of") && rule.tagIds.length === 0;
    case "text":
      return rule.op === "is-not" && (rule.value ?? "") === "";
    default:
      return false;
  }
}

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
   * Shared prune engine: rewriteRule maps each rule to its replacement (or
   * null to drop it). Computes every view's outcome FIRST, then applies all
   * rewrites + deletions in ONE transaction, so an interrupted prune can
   * never land on some views but not others. Returns the deleted view ids.
   *
   * View classification when no complete rule survives: a vacuous match-all
   * rule (`is-not []` etc.) kept the view showing everything, so the view is
   * kept with `[]` rules (same match-all under the completeness gate);
   * otherwise the view could never match anything again and is deleted.
   * Surviving views are persisted with only their complete rules — the same
   * shape createView accepts.
   */
  private async applyViewPrune(
    rewriteRule: (rule: FilterRule) => FilterRule | null,
  ): Promise<string[]> {
    const updates: Array<{ id: string; rulesJson: string }> = [];
    const deletes: string[] = [];
    for (const view of await this.views.listAll()) {
      let changed = false;
      let droppedVacuousMatchAll = false;
      const kept: FilterRules = [];
      for (const rule of view.rules) {
        const next = rewriteRule(rule);
        if (next === null) {
          changed = true;
          if (ruleWasVacuousMatchAll(rule)) droppedVacuousMatchAll = true;
          continue;
        }
        if (next !== rule) changed = true;
        kept.push(next);
      }
      if (!changed) continue;
      const complete = kept.filter(isRuleComplete);
      if (complete.length > 0) {
        updates.push({ id: view.id, rulesJson: JSON.stringify(complete) });
      } else if (droppedVacuousMatchAll) {
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
        if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) return null;
        return { ...rule, optionIds };
      }
      return rule;
    });
  }

  /**
   * Removes every rule referencing a deleted property definition (any
   * kind), with the same view lifecycle policy as pruneOption. Returns the
   * deleted view ids.
   */
  pruneProperty(definitionId: string): Promise<string[]> {
    return this.applyViewPrune((rule) =>
      "propertyId" in rule && rule.propertyId === definitionId ? null : rule,
    );
  }

  /**
   * Startup self-heal: drops saved-view rules referencing property defs or
   * option ids that no longer exist (stranded by an interrupted prune or by
   * deletions from older builds). Idempotent; rewrites land in one
   * transaction.
   */
  async healRules(liveDefs: PropertyDefinition[]): Promise<void> {
    const liveDefIds = new Set(liveDefs.map((d) => d.id));
    const liveOptions = new Map<string, Set<string>>(
      liveDefs.map((d) => [d.id, new Set(d.options.map((o) => o.id))]),
    );
    await this.applyViewPrune((rule) => {
      if ("propertyId" in rule) {
        if (!liveDefIds.has(rule.propertyId)) return null;
        if (rule.kind === "select" || rule.kind === "multiSelect") {
          const live = liveOptions.get(rule.propertyId) ?? new Set<string>();
          const optionIds = rule.optionIds.filter((id) => live.has(id));
          if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) return null;
          if (optionIds.length !== rule.optionIds.length) return { ...rule, optionIds };
        }
      }
      return rule;
    });
  }
}
