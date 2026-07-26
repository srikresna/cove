export interface LegacyRow {
  id: string;
  content: string;
}

export interface IMigrationRepository {
  findLegacyBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  findAllBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  markMigrated(id: string, encryptedContent: string): Promise<void>;
  recordFailure(id: string, reason: string): Promise<void>;
  countLegacy(): Promise<number>;
}
