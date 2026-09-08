import type { EncryptedPayload } from "../domain/EncryptedPayload";
import type { Workspace } from "../domain/workspace/Workspace";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { IWorkspaceRepository } from "./IWorkspaceRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

interface WorkspaceRow {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string | null;
  createdAt: number;
}

const KMS_VERSION_DEK = 1;

export class SQLiteWorkspaceRepository implements IWorkspaceRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  private mapRowToWorkspace(row: WorkspaceRow): Workspace {
    return {
      id: row.id,
      name: row.name,
      emoji: row.emoji,
      color: row.color,
      description: row.description ?? undefined,
      createdAt: row.createdAt,
    };
  }

  async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<WorkspaceRow>>(
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
      const rows = await db.select<Array<WorkspaceRow>>("SELECT * FROM workspaces WHERE id = ?", [
        id,
      ]);
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

    const persisted = await this.getWorkspaceById(id);
    if (!persisted) {
      throw new PersistenceError("updateWorkspace", `Workspace not found after update: ${id}`);
    }
    return persisted;
  }

  async deleteWorkspace(id: string): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction([
        { sql: "DELETE FROM workspaces WHERE id = ?", params: [id] },
      ]);
    } catch (err) {
      throw toPersistenceError("deleteWorkspace", err);
    }
  }

  async getIcon(workspaceId: string): Promise<EncryptedPayload | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ payload: string }>>(
        "SELECT payload FROM workspace_icons WHERE workspaceId = ?",
        [workspaceId],
      );
      const payload = rows[0]?.payload;
      return payload ? (payload as EncryptedPayload) : null;
    } catch (err) {
      throw toPersistenceError("getIcon", err);
    }
  }

  async upsertIcon(workspaceId: string, payload: EncryptedPayload): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO workspace_icons (workspaceId, payload, kmsVersion, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(workspaceId) DO UPDATE SET payload = excluded.payload, kmsVersion = excluded.kmsVersion, updatedAt = excluded.updatedAt",
        [workspaceId, payload, KMS_VERSION_DEK, Date.now()],
      );
    } catch (err) {
      throw toPersistenceError("upsertIcon", err);
    }
  }

  async deleteIcon(workspaceId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM workspace_icons WHERE workspaceId = ?", [workspaceId]);
    } catch (err) {
      throw toPersistenceError("deleteIcon", err);
    }
  }
}
