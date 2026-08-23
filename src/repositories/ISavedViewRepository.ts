import type { SavedView } from "../domain/filters/SavedView";

export interface ISavedViewRepository {
  listByWorkspace(workspaceId: string): Promise<SavedView[]>;
  findById(id: string): Promise<SavedView | null>;
  create(view: SavedView): Promise<void>;
  rename(id: string, name: string): Promise<void>;
  delete(id: string): Promise<void>;
}
