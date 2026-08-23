import { NotFoundError } from "../domain/errors";
import type { FilterRules } from "../domain/filters/FilterRule";
import { isRuleComplete } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import { makeSavedViewId } from "../domain/filters/SavedView";
import { ValidationError } from "../errors/AppError";
import type { ISavedViewRepository } from "../repositories/ISavedViewRepository";
import type { ISavedViewService } from "./ISavedViewService";

function normalizeViewName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
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
   * Removes a deleted select/multiSelect option from every saved view's
   * rules (property defs are global, so views in all workspaces can
   * reference them). Rules left with no option under a value-requiring op
   * are dropped; views left with no rules are deleted — after the value
   * sweep they could never match anything. Returns the deleted view ids.
   */
  async pruneOption(definitionId: string, optionId: string): Promise<string[]> {
    const deleted: string[] = [];
    for (const view of await this.views.listAll()) {
      let changed = false;
      const rules: FilterRules = [];
      for (const rule of view.rules) {
        if (
          (rule.kind === "select" || rule.kind === "multiSelect") &&
          rule.propertyId === definitionId &&
          rule.optionIds.includes(optionId)
        ) {
          changed = true;
          const optionIds = rule.optionIds.filter((id) => id !== optionId);
          if (optionIds.length === 0 && (rule.op === "is" || rule.op === "is-not")) continue;
          rules.push({ ...rule, optionIds });
        } else {
          rules.push(rule);
        }
      }
      if (!changed) continue;
      if (rules.length === 0) {
        await this.views.delete(view.id);
        deleted.push(view.id);
      } else {
        await this.views.updateRules(view.id, rules);
      }
    }
    return deleted;
  }
}
