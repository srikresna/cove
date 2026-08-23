import type { FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";

export interface ISavedViewRepository {
  listByWorkspace(workspaceId: string): Promise<SavedView[]>;
  listAll(): Promise<SavedView[]>;
  findById(id: string): Promise<SavedView | null>;
  create(view: SavedView): Promise<void>;
  rename(id: string, name: string): Promise<void>;
  updateRules(id: string, rules: FilterRules): Promise<void>;
  delete(id: string): Promise<void>;
}
