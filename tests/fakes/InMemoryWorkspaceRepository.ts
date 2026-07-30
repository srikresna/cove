import type { Workspace } from "@/domain/workspace/Workspace";
import type { IWorkspaceRepository } from "@/repositories/IWorkspaceRepository";

export class InMemoryWorkspaceRepository implements IWorkspaceRepository {
  public workspaces: Workspace[] = [];
  public callLog: string[] = [];
  public shouldFail = false;

  async getAllWorkspaces(): Promise<Workspace[]> {
    this.callLog.push("getAllWorkspaces");
    if (this.shouldFail) throw new Error("Fake repo error: getAllWorkspaces");
    return [...this.workspaces];
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    this.callLog.push(`getWorkspaceById:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: getWorkspaceById");
    const found = this.workspaces.find((w) => w.id === id);
    return found ? { ...found } : null;
  }

  async createWorkspace(workspaceInput: Omit<Workspace, "createdAt">): Promise<Workspace> {
    this.callLog.push(`createWorkspace:${workspaceInput.id}`);
    if (this.shouldFail) throw new Error("Fake repo error: createWorkspace");
    const ws: Workspace = { ...workspaceInput, createdAt: Date.now() };
    this.workspaces.push(ws);
    return ws;
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    this.callLog.push(`updateWorkspace:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: updateWorkspace");
    const index = this.workspaces.findIndex((w) => w.id === id);
    const existing = this.workspaces[index];
    if (index === -1 || !existing) throw new Error(`Workspace not found: ${id}`);
    const updated: Workspace = { ...existing, ...updates };
    this.workspaces[index] = updated;
    return updated;
  }

  async deleteWorkspace(id: string): Promise<void> {
    this.callLog.push(`deleteWorkspace:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: deleteWorkspace");
    this.workspaces = this.workspaces.filter((w) => w.id !== id);
  }
}
