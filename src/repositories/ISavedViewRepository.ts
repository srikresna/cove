import type { FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";

export interface ISavedViewRepository {
  listByWorkspace(workspaceId: string): Promise<SavedView[]>;
  listAll(): Promise<SavedView[]>;
  findById(id: string): Promise<SavedView | null>;
  create(view: SavedView): Promise<void>;
  rename(id: string, name: string): Promise<void>;
  updateRules(id: string, rules: FilterRules): Promise<void>;
  /** Persist the manually-included note ids of a view. */
  updateAllowNoteIds(id: string, allowNoteIds: string[]): Promise<void>;
  /**
   * Applies a set of rule rewrites and view deletions in ONE transaction,
   * so a prune either lands on every view or none (a per-view autocommit
   * loop crash-strands the rest with no retry path).
   */
  applyPrune(updates: Array<{ id: string; rulesJson: string }>, deleteIds: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
