import type { EncryptedPayload } from "../domain/EncryptedPayload";
import { toPersistenceError } from "../errors/errorMappers";
import type { CustomIconRow, ICustomIconRepository } from "./ICustomIconRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

interface IconRecordRow extends CustomIconRow {
  payload: string;
}

const KMS_VERSION_DEK = 1;

export class SQLiteCustomIconRepository implements ICustomIconRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async list(): Promise<Array<CustomIconRow & { payload: EncryptedPayload }>> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<IconRecordRow>>(
        "SELECT id, name, payload FROM custom_icons ORDER BY name ASC",
      );
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        payload: row.payload as EncryptedPayload,
      }));
    } catch (err) {
      throw toPersistenceError("customIcons.list", err);
    }
  }

  async get(id: string): Promise<EncryptedPayload | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ payload: string }>>(
        "SELECT payload FROM custom_icons WHERE id = ?",
        [id],
      );
      const payload = rows[0]?.payload;
      return payload ? (payload as EncryptedPayload) : null;
    } catch (err) {
      throw toPersistenceError("customIcons.get", err);
    }
  }

  async upsert(id: string, name: string, payload: EncryptedPayload): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO custom_icons (id, name, payload, kmsVersion, updatedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, payload = excluded.payload, kmsVersion = excluded.kmsVersion, updatedAt = excluded.updatedAt",
        [id, name, payload, KMS_VERSION_DEK, Date.now()],
      );
    } catch (err) {
      throw toPersistenceError("customIcons.upsert", err);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM custom_icons WHERE id = ?", [id]);
    } catch (err) {
      throw toPersistenceError("customIcons.delete", err);
    }
  }
}
