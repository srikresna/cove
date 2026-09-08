import type { Workspace } from "../domain/workspace/Workspace";

export interface IWorkspaceService {
  getAllWorkspaces(): Promise<Workspace[]>;
  getWorkspace(id: string): Promise<Workspace | null>;
  createWorkspace(
    name: string,
    emoji: string,
    color: string,
    description?: string,
  ): Promise<Workspace>;
  updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace>;
  renameWorkspace(id: string, name: string): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
  getIcon(id: string): Promise<string | null>;
  setIcon(id: string, dataUrl: string): Promise<void>;
  removeIcon(id: string): Promise<void>;
}
