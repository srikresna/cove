import type { EncryptedPayload } from "../domain/EncryptedPayload";
import { BusinessRuleError, NotFoundError, ValidationError } from "../domain/errors";
import { canDeleteWorkspace } from "../domain/note/notePolicy";
import type { Workspace } from "../domain/workspace/Workspace";
import type { IWorkspaceRepository } from "../repositories/IWorkspaceRepository";
import type { IWorkspaceService } from "./IWorkspaceService";
import { workspaceIconAad } from "./vault/aad";
import type { IEncryptionService } from "./vault/IEncryptionService";

interface WorkspaceServiceDeps {
  workspaces: IWorkspaceRepository;
  crypto: IEncryptionService;
}

export class WorkspaceService implements IWorkspaceService {
  constructor(private readonly deps: WorkspaceServiceDeps) {}

  private get workspaces(): IWorkspaceRepository {
    return this.deps.workspaces;
  }

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

  async renameWorkspace(id: string, name: string): Promise<Workspace> {
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError("Workspace name cannot be empty.");
    const ws = await this.workspaces.getWorkspaceById(id);
    if (!ws) throw new NotFoundError("Workspace", id);
    return this.workspaces.updateWorkspace(id, { name: trimmed });
  }

  async deleteWorkspace(id: string): Promise<void> {
    const all = await this.workspaces.getAllWorkspaces();
    if (!canDeleteWorkspace(all.length)) {
      throw new BusinessRuleError("Cannot delete the only remaining workspace.");
    }

    const ws = await this.workspaces.getWorkspaceById(id);
    if (!ws) throw new NotFoundError("Workspace", id);

    await this.workspaces.deleteWorkspace(id);
  }

  async getIcon(id: string): Promise<string | null> {
    const payload = await this.workspaces.getIcon(id);
    if (!payload) return null;
    return this.deps.crypto.decryptPayload(payload, workspaceIconAad(id));
  }

  async setIcon(id: string, dataUrl: string): Promise<void> {
    const ws = await this.workspaces.getWorkspaceById(id);
    if (!ws) throw new NotFoundError("Workspace", id);
    const payload: EncryptedPayload = await this.deps.crypto.encryptPayload(
      dataUrl,
      workspaceIconAad(id),
    );
    await this.workspaces.upsertIcon(id, payload);
  }

  async removeIcon(id: string): Promise<void> {
    await this.workspaces.deleteIcon(id);
  }
}
