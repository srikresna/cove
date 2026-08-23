import type { FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";

export interface ISavedViewService {
  listViews(workspaceId: string): Promise<SavedView[]>;
  createView(workspaceId: string, name: string, rules: FilterRules): Promise<SavedView>;
  renameView(id: string, name: string): Promise<void>;
  deleteView(id: string): Promise<void>;
  /** Drop a deleted option from all saved-view rules; returns deleted view ids. */
  pruneOption(definitionId: string, optionId: string): Promise<string[]>;
}
