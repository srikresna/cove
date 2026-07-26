/**
 * Key-management state for the passphrase vault (singleton row, id = 1).
 *
 * Crypto blobs (salt, wrapped DEK, integrity MAC) are stored base64-encoded as
 * TEXT rather than BLOB, to sidestep tauri-plugin-sql byte-binding quirks.
 *
 * See docs/CRYPTO_VAULT_BLUEPRINT.md §0/§10.
 */
export type MigrationState =
  | "pending_migration"
  | "in_progress"
  | "rotation_in_progress"
  | "complete";

export interface KmsRecord {
  kdfVersion: number;
  kdfAlg: string; // "PBKDF2-SHA256" now; "ARGON2ID" later
  kdfParamsJson: string; // '{"iterations":600000}'
  saltB64: string; // base64(16-byte salt)
  ivCounter: number; // monotonic per-DEK AES-GCM IV counter
  wrappedDekLocalB64: string | null; // base64(wrapped DEK) — DB fallback / migration bridge
  integrityMacB64: string; // base64(HMAC envelope binding all kms fields)
  migrationState: MigrationState;
  migrationCursor: string | null; // high-water-mark note id for resumable migration
  createdAt: number;
  updatedAt: number;
}

export interface KmsPatch {
  ivCounter?: number;
  wrappedDekLocalB64?: string | null;
  integrityMacB64?: string;
  migrationState?: MigrationState;
  migrationCursor?: string | null;
}

export interface IKmsRepository {
  /** Returns the kms singleton row, or null if the vault is not yet initialized. */
  get(): Promise<KmsRecord | null>;
  /** Upserts the kms singleton row (id = 1). */
  save(rec: KmsRecord): Promise<void>;
  /** Partial update of mutable fields; returns the resulting record. */
  update(patch: KmsPatch): Promise<KmsRecord>;
  /**
   * Persist the per-DEK IV counter (single-statement UPDATE, autocommit — no
   * transaction, to stay safe under tauri-plugin-sql's pooled connections).
   */
  setIvCounter(n: number): Promise<void>;
}
