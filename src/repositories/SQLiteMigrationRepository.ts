import { toPersistenceError } from "../errors/errorMappers";
import type { IMigrationRepository, LegacyRow, TitleRow } from "./IMigrationRepository";
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

  async findAllCoverBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT noteId AS id, payload AS content FROM note_covers WHERE noteId > ? ORDER BY noteId LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT noteId AS id, payload AS content FROM note_covers ORDER BY noteId LIMIT ?",
            [limit],
          );
      return rows.map((r) => ({ id: String(r.id), content: String(r.content) }));
    } catch (err) {
      throw toPersistenceError("migration.findAllCoverBatch", err);
    }
  }

  async markCoverMigrated(noteId: string, encryptedPayload: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE note_covers SET payload = ?, kmsVersion = 1 WHERE noteId = ?", [
        encryptedPayload,
        noteId,
      ]);
    } catch (err) {
      throw toPersistenceError("migration.markCoverMigrated", err);
    }
  }

  async findAllBlobBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT id, payload AS content FROM note_blobs WHERE id > ? ORDER BY id LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT id, payload AS content FROM note_blobs ORDER BY id LIMIT ?",
            [limit],
          );
      return rows.map((r) => ({ id: String(r.id), content: String(r.content) }));
    } catch (err) {
      throw toPersistenceError("migration.findAllBlobBatch", err);
    }
  }

  async markBlobMigrated(id: string, encryptedPayload: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE note_blobs SET payload = ?, kmsVersion = 1 WHERE id = ?", [
        encryptedPayload,
        id,
      ]);
    } catch (err) {
      throw toPersistenceError("migration.markBlobMigrated", err);
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

  async findTitleBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT id, title AS content FROM notes WHERE titleKmsVersion = 0 AND id > ? ORDER BY id LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT id, title AS content FROM notes WHERE titleKmsVersion = 0 ORDER BY id LIMIT ?",
            [limit],
          );
      return rows.map((r) => ({ id: String(r.id), content: String(r.content) }));
    } catch (err) {
      throw toPersistenceError("migration.findTitleBatch", err);
    }
  }

  async markTitleMigrated(id: string, encryptedTitle: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE notes SET title = ?, titleKmsVersion = 1 WHERE id = ?", [
        encryptedTitle,
        id,
      ]);
    } catch (err) {
      throw toPersistenceError("migration.markTitleMigrated", err);
    }
  }

  async findAllTitlesBatch(afterId: string | null, limit: number): Promise<TitleRow[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT id, title, titleKmsVersion FROM notes WHERE id > ? ORDER BY id LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT id, title, titleKmsVersion FROM notes ORDER BY id LIMIT ?",
            [limit],
          );
      return rows.map((r) => ({
        id: String(r.id),
        title: String(r.title),
        titleKmsVersion: Number(r.titleKmsVersion ?? 0),
      }));
    } catch (err) {
      throw toPersistenceError("migration.findAllTitlesBatch", err);
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
