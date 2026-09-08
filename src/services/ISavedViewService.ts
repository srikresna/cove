import type { FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import type { PropertyDefinition } from "../domain/property/Property";

export interface ISavedViewService {
  listViews(workspaceId: string): Promise<SavedView[]>;
  createView(workspaceId: string, name: string, rules: FilterRules): Promise<SavedView>;
  renameView(id: string, name: string): Promise<void>;
  updateViewRules(id: string, rules: FilterRules): Promise<void>;
  updateViewAllowIds(id: string, allowNoteIds: string[]): Promise<void>;
  deleteView(id: string): Promise<void>;
  pruneOption(definitionId: string, optionId: string): Promise<string[]>;
  pruneProperty(definitionId: string): Promise<string[]>;
  healRules(liveDefs: PropertyDefinition[]): Promise<string[]>;
}
