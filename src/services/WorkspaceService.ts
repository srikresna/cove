import { BusinessRuleError, NotFoundError } from "../domain/errors";
import { canDeleteLastWorkspace } from "../domain/note/notePolicy";
import type { Workspace } from "../domain/workspace/Workspace";
import type { IWorkspaceRepository } from "../repositories/IWorkspaceRepository";
import type { IWorkspaceService } from "./IWorkspaceService";

export class WorkspaceService implements IWorkspaceService {
  constructor(private readonly workspaces: IWorkspaceRepository) {}

  async getAllWorkspaces(): Promise<Workspace[]> {
    return this.workspaces.getAllWorkspaces();
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return this.workspaces.getWorkspaceById(id);
  }

  async createWorkspace(
    name: string,
    emoji: string,
    color: string,
    description?: string,
  ): Promise<Workspace> {
    return this.workspaces.createWorkspace({
      id: crypto.randomUUID(),
      name,
      emoji,
      color,
      description,
    });
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    return this.workspaces.updateWorkspace(id, updates);
  }

  async deleteWorkspace(id: string): Promise<void> {
    // Enforce the business rule from the authoritative source (the repository),
    // never a caller-supplied count that may be stale.
    const all = await this.workspaces.getAllWorkspaces();
    if (!canDeleteLastWorkspace(all.length)) {
      throw new BusinessRuleError("Cannot delete the only remaining workspace.");
    }

    const ws = await this.workspaces.getWorkspaceById(id);
    if (!ws) throw new NotFoundError("Workspace", id);

    // Deleting the workspace cascades to its notes and their children atomically
    // (ON DELETE CASCADE on a foreign_keys=ON transaction connection).
    await this.workspaces.deleteWorkspace(id);
  }
}
