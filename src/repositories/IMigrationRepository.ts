/** Raw (still-encrypted) note rows for the legacy-key -> DEK migration. */
export interface LegacyRow {
  id: string;
  content: string; // encrypted payload (old key), NOT decrypted
}

/**
 * Migration data access, separate from INoteRepository so the vault can read raw
 * ciphertext and rewrite it without going through the (decrypting) note repo.
 * See docs/CRYPTO_VAULT_BLUEPRINT.md §5.
 */
export interface IMigrationRepository {
  /** Next batch of legacy rows (kmsVersion = 0), id-sorted, after `afterId`. */
  findLegacyBatch(afterId: string | null, limit: number): Promise<LegacyRow[]>;
  /** Rewrite a row's content (now under the DEK) and mark it migrated (kmsVersion = 1). */
  markMigrated(id: string, encryptedContent: string): Promise<void>;
  /** Record a corrupt/undecryptable row so the pass continues instead of aborting. */
  recordFailure(id: string, reason: string): Promise<void>;
  countLegacy(): Promise<number>;
}
