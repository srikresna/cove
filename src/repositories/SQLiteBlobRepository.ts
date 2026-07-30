import type { EncryptedPayload } from "../domain/EncryptedPayload";
import { toPersistenceError } from "../errors/errorMappers";
import type { IBlobRecord, IBlobRepository } from "./IBlobRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

function rowToRecord(row: Record<string, unknown>): IBlobRecord {
  return {
    id: String(row.id),
    payload: String(row.payload) as EncryptedPayload,
    kmsVersion: Number(row.kmsVersion),
    updatedAt: Number(row.updatedAt),
  };
}

export class SQLiteBlobRepository implements IBlobRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async get(id: string): Promise<IBlobRecord | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, payload, kmsVersion, updatedAt FROM note_blobs WHERE id = ?",
        [id],
      );
      const row = rows[0];
      return row ? rowToRecord(row) : null;
    } catch (err) {
      throw toPersistenceError("blobs.get", err);
    }
  }

  async upsert(rec: Omit<IBlobRecord, "updatedAt">): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO note_blobs (id, payload, kmsVersion, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, kmsVersion = excluded.kmsVersion, updatedAt = excluded.updatedAt",
        [rec.id, rec.payload, rec.kmsVersion, Date.now()],
      );
    } catch (err) {
      throw toPersistenceError("blobs.upsert", err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM note_blobs WHERE id = ?", [id]);
    } catch (err) {
      throw toPersistenceError("blobs.delete", err);
    }
  }

  async listIds(): Promise<string[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ id: string }>>("SELECT id FROM note_blobs ORDER BY id");
      return rows.map((r) => String(r.id));
    } catch (err) {
      throw toPersistenceError("blobs.listIds", err);
    }
  }

  async findAllBatch(afterId: string | null, limit: number): Promise<IBlobRecord[]> {
    try {
      const db = await this.getDb();
      const rows = afterId
        ? await db.select<Array<Record<string, unknown>>>(
            "SELECT id, payload, kmsVersion, updatedAt FROM note_blobs WHERE id > ? ORDER BY id LIMIT ?",
            [afterId, limit],
          )
        : await db.select<Array<Record<string, unknown>>>(
            "SELECT id, payload, kmsVersion, updatedAt FROM note_blobs ORDER BY id LIMIT ?",
            [limit],
          );
      return rows.map(rowToRecord);
    } catch (err) {
      throw toPersistenceError("blobs.findAllBatch", err);
    }
  }

  async markMigrated(id: string, payload: EncryptedPayload): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE note_blobs SET payload = ?, kmsVersion = 1 WHERE id = ?", [
        payload,
        id,
      ]);
    } catch (err) {
      throw toPersistenceError("blobs.markMigrated", err);
    }
  }
}
