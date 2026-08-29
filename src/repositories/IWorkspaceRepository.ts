import type { Workspace } from "../domain/workspace/Workspace";

export interface IWorkspaceRepository {
  getAllWorkspaces(): Promise<Workspace[]>;
  getWorkspaceById(id: string): Promise<Workspace | null>;
  createWorkspace(workspace: Omit<Workspace, "createdAt">): Promise<Workspace>;
  updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
}
