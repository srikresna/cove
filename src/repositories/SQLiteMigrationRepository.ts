import { toPersistenceError } from "../errors/errorMappers";
import type { IMigrationRepository, LegacyRow } from "./IMigrationRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

export class SQLiteMigrationRepository implements IMigrationRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async findLegacyBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT id, content FROM notes WHERE kmsVersion = 0 AND id > ? ORDER BY id LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT id, content FROM notes WHERE kmsVersion = 0 ORDER BY id LIMIT ?",
            [limit],
          );
      return rows.map((r) => ({ id: String(r.id), content: String(r.content) }));
    } catch (err) {
      throw toPersistenceError("migration.findLegacyBatch", err);
    }
  }

  async findAllBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT id, content FROM notes WHERE id > ? ORDER BY id LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT id, content FROM notes ORDER BY id LIMIT ?",
            [limit],
          );
      return rows.map((r) => ({ id: String(r.id), content: String(r.content) }));
    } catch (err) {
      throw toPersistenceError("migration.findAllBatch", err);
    }
  }

  async markMigrated(id: string, encryptedContent: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE notes SET content = ?, kmsVersion = 1 WHERE id = ?", [
        encryptedContent,
        id,
      ]);
    } catch (err) {
      throw toPersistenceError("migration.markMigrated", err);
    }
  }

  async recordFailure(id: string, reason: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT OR REPLACE INTO migration_failures (id, reason, at) VALUES (?, ?, ?)",
        [id, reason, Date.now()],
      );
    } catch (err) {
      throw toPersistenceError("migration.recordFailure", err);
    }
  }

  async countLegacy(): Promise<number> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ c: number }>>(
        "SELECT COUNT(*) as c FROM notes WHERE kmsVersion = 0",
      );
      return rows[0]?.c ?? 0;
    } catch (err) {
      throw toPersistenceError("migration.countLegacy", err);
    }
  }
}
