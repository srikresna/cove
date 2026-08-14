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
    const all = await this.workspaces.getAllWorkspaces();
    if (!canDeleteLastWorkspace(all.length)) {
      throw new BusinessRuleError("Cannot delete the only remaining workspace.");
    }

    const ws = await this.workspaces.getWorkspaceById(id);
    if (!ws) throw new NotFoundError("Workspace", id);

    await this.workspaces.deleteWorkspace(id);
  }
}
