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
  /** All stored blobs (for DEK rotation: reencrypt every blob under the new key). */
  findAllBlobBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  markBlobMigrated(id: string, encryptedPayload: string): Promise<void>;
  /** Batch of notes whose title is still plaintext (pre-H6), awaiting encryption. */
  findTitleBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  markTitleMigrated(id: string, encryptedTitle: string): Promise<void>;
  /** All note titles (for DEK rotation: reencrypt every title under the new key). */
  findAllTitlesBatch(afterId: string | null, limit: number): Promise<TitleRow[]>;
  recordFailure(id: string, reason: string): Promise<void>;
  countLegacy(): Promise<number>;
}
