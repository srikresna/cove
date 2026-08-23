import type { FilterRule, FilterRules } from "../domain/filters/FilterRule";
import { isFilterKind } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import { toPersistenceError } from "../errors/errorMappers";
import type { ISavedViewRepository } from "./ISavedViewRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

interface StoredRule {
  id: string;
  kind: string;
  propertyId?: string;
  op: string;
  value?: unknown;
  optionIds?: string[];
  tagIds?: string[];
}

function decodeRules(json: string): FilterRules {
  try {
    const parsed = JSON.parse(json) as StoredRule[];
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((r): FilterRule[] => {
      if (!r || typeof r.id !== "string" || !isFilterKind(String(r.kind))) return [];
      const kind = r.kind as FilterRule["kind"];
      const op = String(r.op);
      const value =
        typeof r.value === "number" || typeof r.value === "boolean" || typeof r.value === "string"
          ? r.value
          : undefined;
      const optionIds = Array.isArray(r.optionIds)
        ? r.optionIds.filter((v): v is string => typeof v === "string")
        : [];
      const tagIds = Array.isArray(r.tagIds)
        ? r.tagIds.filter((v): v is string => typeof v === "string")
        : [];
      const propertyId = typeof r.propertyId === "string" ? r.propertyId : "";
      return [{ id: r.id, kind, propertyId, op, value, optionIds, tagIds } as FilterRule];
    });
  } catch {
    return [];
  }
}

function rowToView(row: Record<string, unknown>): SavedView {
  return {
    id: String(row.id),
    workspaceId: String(row.workspaceId),
    name: String(row.name),
    rules: decodeRules(String(row.rulesJson ?? "[]")),
    createdAt: Number(row.createdAt),
  };
}

export class SQLiteSavedViewRepository implements ISavedViewRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async listByWorkspace(workspaceId: string): Promise<SavedView[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, name, rulesJson, createdAt FROM saved_views WHERE workspaceId = ? ORDER BY createdAt, id",
        [workspaceId],
      );
      return rows.map(rowToView);
    } catch (err) {
      throw toPersistenceError("savedViews.listByWorkspace", err);
    }
  }

  async listAll(): Promise<SavedView[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, name, rulesJson, createdAt FROM saved_views ORDER BY createdAt, id",
      );
      return rows.map(rowToView);
    } catch (err) {
      throw toPersistenceError("savedViews.listAll", err);
    }
  }

  async findById(id: string): Promise<SavedView | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, name, rulesJson, createdAt FROM saved_views WHERE id = ?",
        [id],
      );
      const row = rows[0];
      if (!row) return null;
      return rowToView(row);
    } catch (err) {
      throw toPersistenceError("savedViews.findById", err);
    }
  }

  async create(view: SavedView): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO saved_views (id, workspaceId, name, rulesJson, createdAt) VALUES (?, ?, ?, ?, ?)",
        [view.id, view.workspaceId, view.name, JSON.stringify(view.rules), view.createdAt],
      );
    } catch (err) {
      throw toPersistenceError("savedViews.create", err);
    }
  }

  async rename(id: string, name: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE saved_views SET name = ? WHERE id = ?", [name, id]);
    } catch (err) {
      throw toPersistenceError("savedViews.rename", err);
    }
  }

  async updateRules(id: string, rules: FilterRules): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE saved_views SET rulesJson = ? WHERE id = ?", [
        JSON.stringify(rules),
        id,
      ]);
    } catch (err) {
      throw toPersistenceError("savedViews.updateRules", err);
    }
  }

  async applyPrune(
    updates: Array<{ id: string; rulesJson: string }>,
    deleteIds: string[],
  ): Promise<void> {
    if (updates.length === 0 && deleteIds.length === 0) return;
    const statements = [
      ...updates.map((u) => ({
        sql: "UPDATE saved_views SET rulesJson = ? WHERE id = ?",
        params: [u.rulesJson, u.id],
      })),
      ...deleteIds.map((id) => ({
        sql: "DELETE FROM saved_views WHERE id = ?",
        params: [id],
      })),
    ];
    try {
      await SQLiteDatabase.runTransaction(statements);
    } catch (err) {
      throw toPersistenceError("savedViews.applyPrune", err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM saved_views WHERE id = ?", [id]);
    } catch (err) {
      throw toPersistenceError("savedViews.delete", err);
    }
  }
}
