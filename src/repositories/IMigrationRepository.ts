export interface LegacyRow {
  id: string;
  content: string;
}

export interface TitleRow {
  id: string;
  title: string;
  titleKmsVersion: number;
}

export interface IMigrationRepository {
  findLegacyBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  findAllBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  findAllCoverBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  markMigrated(id: string, encryptedContent: string): Promise<void>;
  markCoverMigrated(noteId: string, encryptedPayload: string): Promise<void>;

  findAllBlobBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  markBlobMigrated(id: string, encryptedPayload: string): Promise<void>;

  findTitleBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  markTitleMigrated(id: string, encryptedTitle: string): Promise<void>;

  findAllTitlesBatch(afterId: string | null, limit: number): Promise<TitleRow[]>;
  recordFailure(id: string, reason: string): Promise<void>;
  countLegacy(): Promise<number>;
}
