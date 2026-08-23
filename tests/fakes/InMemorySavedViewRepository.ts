import type { FilterRules } from "@/domain/filters/FilterRule";
import type { SavedView } from "@/domain/filters/SavedView";
import type { ISavedViewRepository } from "@/repositories/ISavedViewRepository";

export class InMemorySavedViewRepository implements ISavedViewRepository {
  public views: SavedView[] = [];

  async listByWorkspace(workspaceId: string): Promise<SavedView[]> {
    return this.views.filter((v) => v.workspaceId === workspaceId).map((v) => ({ ...v }));
  }

  async listAll(): Promise<SavedView[]> {
    return this.views.map((v) => ({ ...v }));
  }

  async findById(id: string): Promise<SavedView | null> {
    const view = this.views.find((v) => v.id === id);
    return view ? { ...view } : null;
  }

  async create(view: SavedView): Promise<void> {
    this.views.push({ ...view });
  }

  async rename(id: string, name: string): Promise<void> {
    this.views = this.views.map((v) => (v.id === id ? { ...v, name } : v));
  }

  async updateRules(id: string, rules: FilterRules): Promise<void> {
    this.views = this.views.map((v) => (v.id === id ? { ...v, rules } : v));
  }

  async applyPrune(
    updates: Array<{ id: string; rulesJson: string }>,
    deleteIds: string[],
  ): Promise<void> {
    for (const update of updates) {
      const rules = JSON.parse(update.rulesJson) as FilterRules;
      await this.updateRules(update.id, rules);
    }
    for (const id of deleteIds) await this.delete(id);
  }

  async delete(id: string): Promise<void> {
    this.views = this.views.filter((v) => v.id !== id);
  }
}
