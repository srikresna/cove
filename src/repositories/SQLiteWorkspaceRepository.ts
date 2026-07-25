import type { Workspace } from "../domain/workspace/Workspace";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { IWorkspaceRepository } from "./IWorkspaceRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

export class SQLiteWorkspaceRepository implements IWorkspaceRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  private mapRowToWorkspace(row: Record<string, unknown>): Workspace {
    return {
      id: String(row.id),
      name: String(row.name),
      emoji: String(row.emoji),
      color: String(row.color),
      description: row.description ? String(row.description) : undefined,
      createdAt: Number(row.createdAt),
    };
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM workspaces ORDER BY createdAt ASC",
      );
      return rows.map((row) => this.mapRowToWorkspace(row));
    } catch (err) {
      throw toPersistenceError("getAllWorkspaces", err);
    }
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM workspaces WHERE id = ?",
        [id],
      );
      if (!rows.length || !rows[0]) return null;
      return this.mapRowToWorkspace(rows[0]);
    } catch (err) {
      throw toPersistenceError("getWorkspaceById", err);
    }
  }

  async createWorkspace(workspaceInput: Omit<Workspace, "createdAt">): Promise<Workspace> {
    const db = await this.getDb();
    const workspace: Workspace = {
      ...workspaceInput,
      createdAt: Date.now(),
    };

    try {
      await db.execute(
        `INSERT INTO workspaces (id, name, emoji, color, description, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          workspace.id,
          workspace.name,
          workspace.emoji,
          workspace.color,
          workspace.description || null,
          workspace.createdAt,
        ],
      );
    } catch (err) {
      throw toPersistenceError("createWorkspace", err);
    }

    return workspace;
  }

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    const existing = await this.getWorkspaceById(id);
    if (!existing) throw new PersistenceError("updateWorkspace", `Workspace not found: ${id}`);

    const db = await this.getDb();
    const updated: Workspace = {
      ...existing,
      ...updates,
    };

    try {
      await db.execute(
        "UPDATE workspaces SET name = ?, emoji = ?, color = ?, description = ? WHERE id = ?",
        [updated.name, updated.emoji, updated.color, updated.description || null, id],
      );
    } catch (err) {
      throw toPersistenceError("updateWorkspace", err);
    }

    return updated;
  }

  async deleteWorkspace(id: string): Promise<void> {
    const db = await this.getDb();
    try {
      await db.execute("DELETE FROM workspaces WHERE id = ?", [id]);
    } catch (err) {
      throw toPersistenceError("deleteWorkspace", err);
    }
  }
}
