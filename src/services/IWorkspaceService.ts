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
  deleteWorkspace(id: string): Promise<void>;
}
