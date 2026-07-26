import { EncryptionError, PersistenceError, ValidationError } from "../errors/AppError";
import type { IKmsRepository, KmsRecord } from "../repositories/IKmsRepository";
import type { IMigrationRepository } from "../repositories/IMigrationRepository";
import type { IVaultService, VaultStatus } from "./IVaultService";
import { Logger } from "./Logger";
import type { IDeviceBind } from "./vault/IDeviceBind";
import type { IEncryptionService } from "./vault/IEncryptionService";
import { type IKeychainStore, KEYRING_USERS } from "./vault/IKeychainStore";
import type { ILegacyKeyStore } from "./vault/ILegacyKeyStore";
import {
  type Bytes,
  aesGcmDecrypt,
  base64ToBytes,
  bytesToBase64,
  computeIntegrityMac,
  computeIntegrityMacDelimited,
  constantTimeEqual,
  deriveSubkey,
  encodeUtf8,
  generateDek,
  generateSalt,
  importAesGcmKey,
  importHmacKey,
  unwrapDek,
  wrapDek,
  zeroize,
} from "./vault/crypto";
import { validatePassphrase } from "./vault/vaultPolicy";

/** v3: length-prefixed MAC fields + kdfParamsJson bound into the envelope MAC. */
const ENVELOPE_VERSION = 3;
const ARGON2ID_ALG = "ARGON2ID";
const ARGON2ID_PARAMS = JSON.stringify({ m_cost: 65536, t_cost: 3, p_cost: 4 });
/** Argon2id envelopes carry no PBKDF2 iteration count; this fixed placeholder fills the MAC field. */
const ARGON2ID_ENVELOPE_ITERATIONS = 0;
const MIGRATION_BATCH = 50;

/** KDF derivation function — injected so tests use JS WebCrypto while production uses Rust invoke. */
export type KdfDerive = (
  passphrase: string,
  salt: Bytes,
  kdfAlg: string,
  kdfParamsJson: string,
) => Promise<Bytes>;

function hexToBytes(hex: string): Bytes {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * PBKDF2 iteration count for a legacy record's envelope MAC. Fails loud on
 * malformed params — a silent default here could diverge from what the KDF
 * actually ran with (the Rust side rejects malformed params the same way).
 */
function parseIterations(kdfParamsJson: string): number {
  try {
    const parsed = JSON.parse(kdfParamsJson) as { iterations?: unknown };
    if (typeof parsed.iterations === "number") return parsed.iterations;
  } catch {
    /* fall through to the loud error */
  }
  throw new EncryptionError(
    "malformed_payload",
    "KDF parameters are malformed (missing iteration count).",
  );
}

/**
 * Errors that doom an entire migration/rotation run (locked vault, broken
 * persistence) — the run must abort and retry at a later unlock instead of
 * mislabeling every remaining row as corrupt.
 */
function isSystemicMigrationError(err: unknown): boolean {
  return (
    err instanceof PersistenceError ||
    (err instanceof EncryptionError && err.reason === "key_unavailable")
  );
}

interface DerivedKeys {
  wrapKey: CryptoKey;
  macKey: CryptoKey;
}

interface Envelope {
  saltB64: string;
  wrappedB64: string;
  integrityMacB64: string;
}

/**
 * Orchestrates the passphrase vault: setup, unlock, lock, migration of legacy
 * notes, passphrase change, and keychain recovery. New vaults use Argon2id
 * (OWASP first-choice KDF, via Rust). Existing PBKDF2 vaults are backward-compat.
 */
export class VaultService implements IVaultService {
  /**
   * Raw DEK bytes for the unlocked session. Kept (in addition to the
   * non-extractable CryptoKey in the encryption service) because keychain
   * escrow ("Trust this device") must be able to device-wrap the DEK on
   * demand; zeroized on lock and whenever it is replaced.
   */
  private rawDek: Bytes | null = null;
  /**
   * In-flight unlock/auto-unlock attempt. Concurrent callers queue behind it
   * and then run their own attempt — nobody gets success semantics for an
   * attempt that never verified their passphrase.
   */
  private unlockInFlight: Promise<unknown> | null = null;
  private lockListeners: Array<() => void> = [];

  constructor(
    private readonly crypto: IEncryptionService,
    private readonly kms: IKmsRepository,
    private readonly keychain: IKeychainStore,
    private readonly migrationRepo: IMigrationRepository,
    private readonly deviceBind: IDeviceBind,
    private readonly deriveKeyFn: KdfDerive,
    private readonly legacyKeys: ILegacyKeyStore,
  ) {}

  isUnlocked(): boolean {
    return this.crypto.isUnlocked();
  }

  onLock(listener: () => void): void {
    this.lockListeners.push(listener);
  }

  async computeStatus(): Promise<VaultStatus> {
    const rec = await this.kms.get();
    if (!rec) return "uninitialized";
    // An interrupted legacy migration no longer gates the app behind a dead
    // screen — the resume runs inside the next successful unlock instead.
    return this.crypto.isUnlocked() ? "unlocked" : "locked";
  }

  private async deriveKeys(
    passphrase: string,
    salt: Bytes,
    kdfAlg: string,
    kdfParamsJson: string,
  ): Promise<DerivedKeys> {
    const prk = await this.deriveKeyFn(passphrase, salt, kdfAlg, kdfParamsJson);
    const wrapRaw = await deriveSubkey(prk, "dek-wrap");
    const macRaw = await deriveSubkey(prk, "integrity-mac");
    zeroize(prk);
    const wrapKey = await importAesGcmKey(wrapRaw);
    const macKey = await importHmacKey(macRaw);
    zeroize(wrapRaw);
    zeroize(macRaw);
    return { wrapKey, macKey };
  }

  private async envelopeMac(
    macKey: CryptoKey,
    saltB64: string,
    iterations: number,
    kdfVersion: number,
    kdfAlg: string,
    kdfParamsJson: string,
    wrappedDekB64: string,
  ): Promise<string> {
    const fields = [saltB64, String(iterations), String(kdfVersion), kdfAlg, wrappedDekB64];
    if (kdfVersion >= ENVELOPE_VERSION) {
      // v3+: length-prefixed fields (no boundary ambiguity) and the raw KDF
      // params bound in, so stored Argon2/PBKDF2 costs are tamper-evident.
      return bytesToBase64(
        await computeIntegrityMacDelimited(macKey, [...fields, kdfParamsJson].map(encodeUtf8)),
      );
    }
    return bytesToBase64(await computeIntegrityMac(macKey, fields.map(encodeUtf8)));
  }

  private recIterations(rec: KmsRecord): number {
    return rec.kdfAlg === ARGON2ID_ALG
      ? ARGON2ID_ENVELOPE_ITERATIONS
      : parseIterations(rec.kdfParamsJson);
  }

  private async setSessionDek(rawDek: Bytes, cryptoKey: CryptoKey): Promise<void> {
    if (this.rawDek && this.rawDek !== rawDek) zeroize(this.rawDek);
    this.rawDek = rawDek;
    await this.crypto.setSessionKeys({ dek: cryptoKey });
  }

  /** Fresh salt + Argon2id-derived wrap/MAC keys + wrapped DEK + v3 envelope MAC. */
  private async buildArgon2Envelope(passphrase: string, rawDek: Bytes): Promise<Envelope> {
    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(
      passphrase,
      salt,
      ARGON2ID_ALG,
      ARGON2ID_PARAMS,
    );
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, rawDek));
    const integrityMacB64 = await this.envelopeMac(
      macKey,
      saltB64,
      ARGON2ID_ENVELOPE_ITERATIONS,
      ENVELOPE_VERSION,
      ARGON2ID_ALG,
      ARGON2ID_PARAMS,
      wrappedB64,
    );
    return { saltB64, wrappedB64, integrityMacB64 };
  }

  async setupPassphrase(passphrase: string): Promise<void> {
    const check = validatePassphrase(passphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid passphrase");
    if (await this.kms.get()) {
      // Re-running setup would mint a fresh DEK and orphan every existing note.
      throw new ValidationError("Vault is already initialized.");
    }

    const dek = await generateDek();
    const env = await this.buildArgon2Envelope(passphrase, dek.rawKey);
    const now = Date.now();
    const rec: KmsRecord = {
      kdfVersion: ENVELOPE_VERSION,
      kdfAlg: ARGON2ID_ALG,
      kdfParamsJson: ARGON2ID_PARAMS,
      saltB64: env.saltB64,
      ivCounter: 0,
      wrappedDekLocalB64: env.wrappedB64,
      integrityMacB64: env.integrityMacB64,
      migrationState: "pending_migration",
      migrationCursor: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.kms.save(rec);
    await this.setSessionDek(dek.rawKey, dek.cryptoKey);

    const legacyHex = this.legacyKeys.get();
    if (legacyHex) {
      try {
        // Bridge for crash resume: if setup dies mid-migration, the next
        // unlock finds this key and finishes the job.
        await this.keychain.set(KEYRING_USERS.legacyBridge, legacyHex);
      } catch {
        /* best-effort */
      }
      await this.kms.update({ migrationState: "in_progress" });
      const legacyRaw = hexToBytes(legacyHex);
      let failed: number;
      try {
        failed = await this.migrateLegacy(legacyRaw);
      } finally {
        zeroize(legacyRaw);
      }
      await this.finishLegacyRun(failed);
    } else {
      await this.kms.update({ migrationState: "complete", migrationCursor: null });
      await this.purgeLegacyKeyMaterial();
    }
  }

  /**
   * Key material is purged ONLY after a run with zero recorded failures — a
   * transient failure must never destroy the last key able to decrypt the
   * affected rows. With failures, the state stays resumable and the bridge key
   * is retained so the next unlock retries.
   */
  private async finishLegacyRun(failed: number): Promise<void> {
    if (failed === 0) {
      await this.kms.update({ migrationState: "complete", migrationCursor: null });
      await this.purgeLegacyKeyMaterial();
    } else {
      Logger.warn("vault: migration recorded failures; legacy key retained for retry", { failed });
    }
  }

  /**
   * Crash-safe resume: if a key-migration run was interrupted, finish it now
   * using the bridge key persisted in the keychain. Handles both the legacy
   * migration ('pending_migration'/'in_progress'; hex bridge) and a DEK
   * rotation ('rotation_in_progress'; base64 bridge). Runs after every
   * successful unlock, so a crash mid-run can no longer strand the vault.
   */
  private async completePendingMigration(): Promise<void> {
    const rec = await this.kms.get();
    if (!rec || rec.migrationState === "complete") return;
    let bridge: string | null = null;
    try {
      bridge = await this.keychain.get(KEYRING_USERS.legacyBridge);
    } catch (err) {
      // Keychain unavailable — fall back to the legacy store lookup below.
      Logger.warn("vault: keychain bridge lookup failed during migration resume", err);
    }

    if (rec.migrationState === "rotation_in_progress") {
      if (!bridge) {
        Logger.warn("vault: interrupted DEK rotation but no bridge key; unswept rows left as-is");
        return;
      }
      const oldRaw = base64ToBytes(bridge);
      const oldKey = await importAesGcmKey(oldRaw);
      zeroize(oldRaw);
      const failed = await this.reencryptAllNotes(oldKey, rec.migrationCursor);
      if (failed === 0) {
        await this.kms.update({ migrationState: "complete", migrationCursor: null });
        await this.purgeLegacyKeyMaterial();
      } else {
        Logger.warn("vault: rotation sweep recorded failures; bridge key retained", { failed });
      }
      return;
    }

    const legacyHex = bridge ?? this.legacyKeys.get();
    if (!legacyHex) {
      if ((await this.migrationRepo.countLegacy()) === 0) {
        // Nothing left below the current key version — the interrupted run
        // actually finished; only the state flip was lost.
        await this.kms.update({ migrationState: "complete", migrationCursor: null });
      } else {
        Logger.warn("vault: interrupted migration but no bridge key; legacy rows left as-is", {
          migrationState: rec.migrationState,
        });
      }
      return;
    }
    await this.kms.update({ migrationState: "in_progress" });
    const legacyRaw = hexToBytes(legacyHex);
    let failed: number;
    try {
      failed = await this.migrateLegacy(legacyRaw);
    } finally {
      zeroize(legacyRaw);
    }
    await this.finishLegacyRun(failed);
  }

  private async purgeLegacyKeyMaterial(): Promise<void> {
    this.legacyKeys.remove();
    try {
      await this.keychain.delete(KEYRING_USERS.legacyBridge);
    } catch {
      /* best-effort */
    }
  }

  /** @returns rows recorded as per-row failures (corrupt ciphertext). Systemic errors rethrow. */
  private async migrateLegacy(legacyRawKey: Bytes): Promise<number> {
    const legacyKey = await importAesGcmKey(legacyRawKey);
    const rec = await this.kms.get();
    let cursor: string | null = rec?.migrationCursor ?? null;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findLegacyBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        try {
          const plain = await aesGcmDecrypt(legacyKey, row.content);
          const reencrypted = await this.crypto.encryptPayload(plain, row.id);
          await this.migrationRepo.markMigrated(row.id, reencrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          failed += 1;
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
        cursor = row.id;
      }
      await this.kms.update({ migrationCursor: cursor });
    }
    return failed;
  }

  async unlock(passphrase: string): Promise<void> {
    while (this.unlockInFlight) {
      await this.unlockInFlight.then(
        () => {},
        () => {},
      );
    }
    const attempt = this.doUnlock(passphrase);
    this.unlockInFlight = attempt;
    try {
      await attempt;
    } finally {
      this.unlockInFlight = null;
    }
  }

  /**
   * Verify a passphrase against the stored envelope and return the unwrapped
   * DEK. This is the single passphrase oracle — unlock AND changePassphrase
   * both go through it, so neither can skip verification via session state.
   */
  private async verifyPassphraseAndUnwrap(passphrase: string, rec: KmsRecord): Promise<Bytes> {
    const { wrapKey, macKey } = await this.deriveKeys(
      passphrase,
      base64ToBytes(rec.saltB64),
      rec.kdfAlg,
      rec.kdfParamsJson,
    );

    const expectedMac = await this.envelopeMac(
      macKey,
      rec.saltB64,
      this.recIterations(rec),
      rec.kdfVersion,
      rec.kdfAlg,
      rec.kdfParamsJson,
      rec.wrappedDekLocalB64 ?? "",
    );
    if (!constantTimeEqual(base64ToBytes(rec.integrityMacB64), base64ToBytes(expectedMac))) {
      throw new EncryptionError(
        "decrypt_failed",
        "Vault integrity check failed (possibly tampered).",
      );
    }

    const wrappedB64 = rec.wrappedDekLocalB64 ?? (await this.keychain.get(KEYRING_USERS.dekBackup));
    if (!wrappedB64) {
      throw new EncryptionError(
        "key_unavailable",
        "No wrapped DEK available; recovery impossible.",
      );
    }
    try {
      return await unwrapDek(wrapKey, base64ToBytes(wrappedB64));
    } catch (cause) {
      throw new EncryptionError("decrypt_failed", "Wrong passphrase.", { cause });
    }
  }

  private async doUnlock(passphrase: string): Promise<void> {
    const rec = await this.kms.get();
    if (!rec) throw new ValidationError("Vault is not initialized yet.");
    const rawDek = await this.verifyPassphraseAndUnwrap(passphrase, rec);
    await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));
    // Unlock itself never touches the escrow entry: a broken keychain cannot
    // block a correct-passphrase unlock, and a pre-existing entry is never
    // silently refreshed behind the user's Trust-this-device setting (the
    // store re-escrows after unlock when — and only when — trust is enabled).
    await this.resumeMigrationBestEffort();
  }

  /** The session is already unlocked; a failed resume retries at the next unlock. */
  private async resumeMigrationBestEffort(): Promise<void> {
    try {
      await this.completePendingMigration();
    } catch (err) {
      Logger.warn("vault: migration resume failed; will retry at next unlock", err);
    }
  }

  async lock(): Promise<void> {
    // Wait out any in-flight unlock: zeroizing this.rawDek mid-attempt could
    // otherwise hand zeroed key bytes to an operation still using the buffer.
    while (this.unlockInFlight) {
      await this.unlockInFlight.then(
        () => {},
        () => {},
      );
    }
    if (this.rawDek) zeroize(this.rawDek);
    this.rawDek = null;
    this.crypto.clearSessionKeys();
    for (const listener of this.lockListeners) listener();
  }

  async tryAutoUnlock(): Promise<boolean> {
    while (this.unlockInFlight) {
      await this.unlockInFlight.then(
        () => {},
        () => {},
      );
    }
    const attempt = this.doTryAutoUnlock();
    this.unlockInFlight = attempt;
    try {
      return await attempt;
    } finally {
      this.unlockInFlight = null;
    }
  }

  private async doTryAutoUnlock(): Promise<boolean> {
    const rec = await this.kms.get();
    if (!rec) return false;
    const backup = await this.keychain.get(KEYRING_USERS.dekBackup);
    if (!backup) return false;
    try {
      // No raw-blob fallback: a backup that fails device unwrap is treated as
      // tampered/foreign, never silently accepted as a plaintext DEK.
      const rawDek = await this.deviceBind.unwrap(base64ToBytes(backup));
      await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));
      await this.resumeMigrationBestEffort();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Device-wrap a private COPY of the DEK into the keychain — never hands the
   * shared session buffer across awaits where a concurrent lock() could
   * zeroize it into an all-zero escrow entry.
   */
  private async writeEscrow(rawDek: Bytes): Promise<void> {
    const copy = new Uint8Array(rawDek);
    try {
      const wrapped = await this.deviceBind.wrap(copy);
      await this.keychain.set(KEYRING_USERS.dekBackup, bytesToBase64(wrapped));
    } finally {
      zeroize(copy);
    }
  }

  async setKeychainEscrow(enabled: boolean): Promise<void> {
    if (!enabled) {
      await this.keychain.delete(KEYRING_USERS.dekBackup);
      return;
    }
    if (!this.rawDek) {
      throw new EncryptionError("key_unavailable", "Unlock the vault before trusting this device.");
    }
    await this.writeEscrow(this.rawDek);
  }

  async changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<void> {
    const check = validatePassphrase(newPassphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid new passphrase");
    const rec = await this.kms.get();
    if (!rec) throw new EncryptionError("key_unavailable", "Vault not initialized.");

    // Explicit old-passphrase verification against the stored envelope — never
    // relies on unlock()'s session side effects (a concurrent unlock could
    // have primed them without this passphrase ever being checked).
    const rawDek = await this.verifyPassphraseAndUnwrap(oldPassphrase, rec);

    const env = await this.buildArgon2Envelope(newPassphrase, rawDek);
    const updated: KmsRecord = {
      ...rec,
      kdfVersion: ENVELOPE_VERSION,
      kdfAlg: ARGON2ID_ALG,
      kdfParamsJson: ARGON2ID_PARAMS,
      saltB64: env.saltB64,
      wrappedDekLocalB64: env.wrappedB64,
      integrityMacB64: env.integrityMacB64,
      updatedAt: Date.now(),
    };
    await this.kms.save(updated);
    // No escrow touch needed: the DEK itself is unchanged by a passphrase
    // change, so an existing escrow entry remains valid as-is.
    await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));
  }

  async recoverViaKeychain(newPassphrase: string): Promise<void> {
    const backupB64 = await this.keychain.get(KEYRING_USERS.dekBackup);
    if (!backupB64) {
      throw new EncryptionError("key_unavailable", "No keychain backup; recovery impossible.");
    }
    const check = validatePassphrase(newPassphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid passphrase");

    const recoveredDek = await this.deviceBind.unwrap(base64ToBytes(backupB64));
    const existing = await this.kms.get();
    if (existing) {
      // Normal recovery: same DEK under a new passphrase envelope. The
      // persisted ivCounter is preserved, so the IV sequence keeps advancing.
      const env = await this.buildArgon2Envelope(newPassphrase, recoveredDek);
      await this.kms.save({
        ...existing,
        kdfVersion: ENVELOPE_VERSION,
        kdfAlg: ARGON2ID_ALG,
        kdfParamsJson: ARGON2ID_PARAMS,
        saltB64: env.saltB64,
        wrappedDekLocalB64: env.wrappedB64,
        integrityMacB64: env.integrityMacB64,
        updatedAt: Date.now(),
      });
      await this.setSessionDek(recoveredDek, await importAesGcmKey(recoveredDek));
      try {
        await this.writeEscrow(recoveredDek);
      } catch (err) {
        // Best-effort: the entry we just read still holds this same DEK.
        Logger.warn("vault: escrow refresh failed during recovery", err);
      }
      await this.resumeMigrationBestEffort();
      return;
    }
    await this.recoverWithDekRotation(newPassphrase, recoveredDek);
  }

  /**
   * kms row missing but a keychain DEK backup exists (partial DB corruption or
   * tampering). The old DEK's IV counter is unknown, so reusing that DEK would
   * risk AES-GCM nonce reuse against ciphertexts surviving in exported backups.
   * Instead: mint a fresh DEK (counter restarts safely at 0) and re-encrypt
   * every note from the old DEK to the new one.
   *
   * Crash-safety ordering: the old DEK is parked in the bridge slot (base64)
   * and the keychain backup is replaced with the NEW DEK before any other
   * state persists — from that point on, no crash can ever auto-unlock a
   * session under the old DEK against the new (reset) IV space. The kms row
   * carries 'rotation_in_progress' until the sweep completes, so an
   * interrupted sweep resumes at the next unlock via completePendingMigration.
   */
  private async recoverWithDekRotation(newPassphrase: string, oldRawDek: Bytes): Promise<void> {
    // NOT best-effort: the crash-resume path depends on this copy of the old DEK.
    await this.keychain.set(KEYRING_USERS.legacyBridge, bytesToBase64(oldRawDek));
    const oldKey = await importAesGcmKey(oldRawDek);
    const dek = await generateDek();
    await this.writeEscrow(dek.rawKey);
    const env = await this.buildArgon2Envelope(newPassphrase, dek.rawKey);
    const now = Date.now();
    await this.kms.save({
      kdfVersion: ENVELOPE_VERSION,
      kdfAlg: ARGON2ID_ALG,
      kdfParamsJson: ARGON2ID_PARAMS,
      saltB64: env.saltB64,
      ivCounter: 0,
      wrappedDekLocalB64: env.wrappedB64,
      integrityMacB64: env.integrityMacB64,
      migrationState: "rotation_in_progress",
      migrationCursor: null,
      createdAt: now,
      updatedAt: now,
    });
    zeroize(oldRawDek);
    await this.setSessionDek(dek.rawKey, dek.cryptoKey);
    const failed = await this.reencryptAllNotes(oldKey, null);
    if (failed === 0) {
      await this.kms.update({ migrationState: "complete", migrationCursor: null });
      await this.purgeLegacyKeyMaterial();
    } else {
      Logger.warn("vault: rotation sweep recorded failures; bridge key retained", { failed });
    }
  }

  /**
   * Rotation sweep: decrypt every row under `oldKey`, re-encrypt under the
   * session DEK. Resumable: persists a cursor per batch and skips rows already
   * re-encrypted under the session DEK (from a previous interrupted run).
   * @returns rows recorded as failures (undecryptable under either key).
   */
  private async reencryptAllNotes(oldKey: CryptoKey, startCursor: string | null): Promise<number> {
    let cursor = startCursor;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findAllBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        cursor = row.id;
        if (!row.content) continue;
        try {
          let plain: string;
          try {
            plain = await aesGcmDecrypt(oldKey, row.content, encodeUtf8(row.id));
          } catch {
            // Pre-AAD ciphertexts were encrypted without additionalData.
            plain = await aesGcmDecrypt(oldKey, row.content);
          }
          const reencrypted = await this.crypto.encryptPayload(plain, row.id);
          await this.migrationRepo.markMigrated(row.id, reencrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          try {
            // Not old-DEK ciphertext — already rotated by an interrupted run?
            await this.crypto.decryptPayload(row.content, row.id);
            continue;
          } catch (err2) {
            if (isSystemicMigrationError(err2)) throw err2;
            /* not under the session DEK either — genuinely undecryptable */
          }
          failed += 1;
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      await this.kms.update({ migrationCursor: cursor });
    }
    return failed;
  }
}
