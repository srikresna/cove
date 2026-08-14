import type { EncryptedPayload } from "../domain/EncryptedPayload";

export interface IBlobRecord {
  id: string;
  payload: EncryptedPayload;
  kmsVersion: number;
  updatedAt: number;
}

export interface IBlobRepository {
  get(id: string): Promise<IBlobRecord | null>;
  upsert(rec: Omit<IBlobRecord, "updatedAt">): Promise<void>;
  delete(id: string): Promise<void>;
  listIds(): Promise<string[]>;

  findAllBatch(afterId: string | null, limit: number): Promise<IBlobRecord[]>;
  markMigrated(id: string, payload: EncryptedPayload): Promise<void>;
}
