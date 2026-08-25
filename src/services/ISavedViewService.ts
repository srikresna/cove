import type { FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import type { PropertyDefinition } from "../domain/property/Property";

export interface ISavedViewService {
  listViews(workspaceId: string): Promise<SavedView[]>;
  createView(workspaceId: string, name: string, rules: FilterRules): Promise<SavedView>;
  renameView(id: string, name: string): Promise<void>;
  /** Persist edited rules back into an existing view. */
  updateViewRules(id: string, rules: FilterRules): Promise<void>;
  /** Persist the manually-included note ids of an existing view. */
  updateViewAllowIds(id: string, allowNoteIds: string[]): Promise<void>;
  deleteView(id: string): Promise<void>;
  /** Drop a deleted option from all saved-view rules; returns deleted view ids. */
  pruneOption(definitionId: string, optionId: string): Promise<string[]>;
  /** Drop all rules referencing a deleted property; returns deleted view ids. */
  pruneProperty(definitionId: string): Promise<string[]>;
  /** Startup self-heal of rules referencing dead defs/options; returns deleted view ids. */
  healRules(liveDefs: PropertyDefinition[]): Promise<string[]>;
}
