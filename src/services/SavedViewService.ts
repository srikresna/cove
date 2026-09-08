import { NotFoundError } from "../domain/errors";
import type { FilterRule, FilterRules } from "../domain/filters/FilterRule";
import { isRuleComplete } from "../domain/filters/FilterRule";
import {
  dropDeadDef,
  healRule,
  type RuleRewrite,
  removeOption,
} from "../domain/filters/ruleMaintenance";
import type { SavedView } from "../domain/filters/SavedView";
import { makeSavedViewId } from "../domain/filters/SavedView";
import type { PropertyDefinition } from "../domain/property/Property";
import { ValidationError } from "../errors/AppError";
import type { ISavedViewRepository } from "../repositories/ISavedViewRepository";
import type { ISavedViewService } from "./ISavedViewService";

function normalizeViewName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

type PruneRewrite = { drop: false; rule: FilterRule } | { drop: true; postDeleteMatchAll: boolean };

function toPruneRewrite(r: RuleRewrite): PruneRewrite {
  return r.drop
    ? { drop: true, postDeleteMatchAll: r.vacuouslyAll }
    : { drop: false, rule: r.rule };
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
      allowNoteIds: [],
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
    const existing = await this.views.listByWorkspace(view.workspaceId);
    if (existing.some((v) => v.id !== id && v.name.toLowerCase() === normalized.toLowerCase())) {
      throw new ValidationError("A view with this name already exists.");
    }
    await this.views.rename(id, normalized);
  }

  async updateViewRules(id: string, rules: FilterRules): Promise<void> {
    const view = await this.views.findById(id);
    if (!view) throw new NotFoundError("SavedView", id);
    if (rules.filter(isRuleComplete).length === 0) {
      throw new ValidationError("Pick a value for at least one rule before saving.");
    }
    await this.views.updateRules(id, rules);
  }

  async updateViewAllowIds(id: string, allowNoteIds: string[]): Promise<void> {
    const view = await this.views.findById(id);
    if (!view) throw new NotFoundError("SavedView", id);
    await this.views.updateAllowNoteIds(id, allowNoteIds);
  }

  deleteView(id: string): Promise<void> {
    return this.views.delete(id);
  }

  private async applyViewPrune(rewriteRule: (rule: FilterRule) => PruneRewrite): Promise<string[]> {
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

  pruneOption(definitionId: string, optionId: string): Promise<string[]> {
    return this.applyViewPrune((rule) =>
      toPruneRewrite(removeOption(rule, definitionId, optionId)),
    );
  }

  pruneProperty(definitionId: string): Promise<string[]> {
    return this.applyViewPrune((rule) => toPruneRewrite(dropDeadDef(rule, definitionId)));
  }

  healRules(liveDefs: PropertyDefinition[]): Promise<string[]> {
    return this.applyViewPrune((rule) => toPruneRewrite(healRule(rule, liveDefs)));
  }
}
