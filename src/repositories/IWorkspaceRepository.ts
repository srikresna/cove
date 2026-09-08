import type { EncryptedPayload } from "../domain/EncryptedPayload";
import type { Workspace } from "../domain/workspace/Workspace";

export interface IWorkspaceRepository {
  getAllWorkspaces(): Promise<Workspace[]>;
  getWorkspaceById(id: string): Promise<Workspace | null>;
  createWorkspace(workspace: Omit<Workspace, "createdAt">): Promise<Workspace>;
  updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
  getIcon(workspaceId: string): Promise<EncryptedPayload | null>;
  upsertIcon(workspaceId: string, payload: EncryptedPayload): Promise<void>;
  deleteIcon(workspaceId: string): Promise<void>;
}
