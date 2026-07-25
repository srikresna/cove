import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { IKmsRepository, KmsPatch, KmsRecord } from "./IKmsRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

const SELECT_SQL =
  "SELECT kdfVersion, kdfAlg, kdfParamsJson, saltB64, ivCounter, wrappedDekLocalB64, integrityMacB64, migrationState, migrationCursor, createdAt, updatedAt FROM kms WHERE id = 1";

function rowToRecord(row: Record<string, unknown>): KmsRecord {
  return {
    kdfVersion: Number(row.kdfVersion),
    kdfAlg: String(row.kdfAlg),
    kdfParamsJson: String(row.kdfParamsJson),
    saltB64: String(row.saltB64),
    ivCounter: Number(row.ivCounter),
    wrappedDekLocalB64: row.wrappedDekLocalB64 != null ? String(row.wrappedDekLocalB64) : null,
    integrityMacB64: String(row.integrityMacB64),
    migrationState: String(row.migrationState) as KmsRecord["migrationState"],
    migrationCursor: row.migrationCursor != null ? String(row.migrationCursor) : null,
    createdAt: Number(row.createdAt),
    updatedAt: Number(row.updatedAt),
  };
}

export class SQLiteKmsRepository implements IKmsRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async get(): Promise<KmsRecord | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(SELECT_SQL);
      if (!rows.length || !rows[0]) return null;
      return rowToRecord(rows[0]);
    } catch (err) {
      throw toPersistenceError("kms.get", err);
    }
  }

  async save(rec: KmsRecord): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        `INSERT OR REPLACE INTO kms
          (id, kdfVersion, kdfAlg, kdfParamsJson, saltB64, ivCounter, wrappedDekLocalB64, integrityMacB64, migrationState, migrationCursor, createdAt, updatedAt)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rec.kdfVersion,
          rec.kdfAlg,
          rec.kdfParamsJson,
          rec.saltB64,
          rec.ivCounter,
          rec.wrappedDekLocalB64,
          rec.integrityMacB64,
          rec.migrationState,
          rec.migrationCursor,
          rec.createdAt,
          rec.updatedAt,
        ],
      );
    } catch (err) {
      throw toPersistenceError("kms.save", err);
    }
  }

  async update(patch: KmsPatch): Promise<KmsRecord> {
    try {
      const db = await this.getDb();
      const sets: string[] = [];
      const params: unknown[] = [];
      if (patch.ivCounter !== undefined) {
        sets.push("ivCounter = ?");
        params.push(patch.ivCounter);
      }
      if (patch.wrappedDekLocalB64 !== undefined) {
        sets.push("wrappedDekLocalB64 = ?");
        params.push(patch.wrappedDekLocalB64);
      }
      if (patch.integrityMacB64 !== undefined) {
        sets.push("integrityMacB64 = ?");
        params.push(patch.integrityMacB64);
      }
      if (patch.migrationState !== undefined) {
        sets.push("migrationState = ?");
        params.push(patch.migrationState);
      }
      if (patch.migrationCursor !== undefined) {
        sets.push("migrationCursor = ?");
        params.push(patch.migrationCursor);
      }
      sets.push("updatedAt = ?");
      params.push(Date.now());
      params.push(1);
      await db.execute(`UPDATE kms SET ${sets.join(", ")} WHERE id = 1`, params);
      const after = await this.get();
      if (!after) throw new PersistenceError("kms.update", "kms row missing after update");
      return after;
    } catch (err) {
      throw toPersistenceError("kms.update", err);
    }
  }

  async setIvCounter(n: number): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE kms SET ivCounter = ? WHERE id = 1", [n]);
    } catch (err) {
      throw toPersistenceError("kms.setIvCounter", err);
    }
  }
}
