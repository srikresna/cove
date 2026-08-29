import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { IKmsRepository, KmsPatch, KmsRecord } from "./IKmsRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

interface KmsRow {
  kdfVersion: number;
  kdfAlg: string;
  kdfParamsJson: string;
  saltB64: string;
  ivCounter: number;
  wrappedDekLocalB64: string | null;
  integrityMacB64: string;
  migrationState: string;
  migrationCursor: string | null;
  createdAt: number;
  updatedAt: number;
}

const SELECT_SQL =
  "SELECT kdfVersion, kdfAlg, kdfParamsJson, saltB64, ivCounter, wrappedDekLocalB64, integrityMacB64, migrationState, migrationCursor, createdAt, updatedAt FROM kms WHERE id = 1";

function rowToRecord(row: KmsRow): KmsRecord {
  return {
    kdfVersion: row.kdfVersion,
    kdfAlg: row.kdfAlg,
    kdfParamsJson: row.kdfParamsJson,
    saltB64: row.saltB64,
    ivCounter: row.ivCounter,
    wrappedDekLocalB64: row.wrappedDekLocalB64,
    integrityMacB64: row.integrityMacB64,
    migrationState: row.migrationState as KmsRecord["migrationState"],
    migrationCursor: row.migrationCursor,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class SQLiteKmsRepository implements IKmsRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async get(): Promise<KmsRecord | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<KmsRow>>(SELECT_SQL);
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
      if (patch.kdfVersion !== undefined) {
        sets.push("kdfVersion = ?");
        params.push(patch.kdfVersion);
      }
      if (patch.kdfAlg !== undefined) {
        sets.push("kdfAlg = ?");
        params.push(patch.kdfAlg);
      }
      if (patch.kdfParamsJson !== undefined) {
        sets.push("kdfParamsJson = ?");
        params.push(patch.kdfParamsJson);
      }
      if (patch.saltB64 !== undefined) {
        sets.push("saltB64 = ?");
        params.push(patch.saltB64);
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
      await db.execute("UPDATE kms SET ivCounter = ? WHERE id = 1 AND ivCounter < ?", [n, n]);
    } catch (err) {
      throw toPersistenceError("kms.setIvCounter", err);
    }
  }
}
