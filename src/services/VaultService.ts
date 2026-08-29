import { EncryptionError, PersistenceError, ValidationError } from "../errors/AppError";
import type { IKmsRepository, KmsRecord } from "../repositories/IKmsRepository";
import type { IMigrationRepository } from "../repositories/IMigrationRepository";
import type { IVaultService, VaultStatus } from "./IVaultService";
import { Logger } from "./Logger";
import { blobAad, coverAad, titleAad } from "./vault/aad";
import {
  aesGcmDecrypt,
  aesGcmDecryptBytes,
  type Bytes,
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
import type { IDeviceBind } from "./vault/IDeviceBind";
import type { EncryptedPayload, IEncryptionService } from "./vault/IEncryptionService";
import { type IKeychainStore, KEYRING_USERS } from "./vault/IKeychainStore";
import type { ILegacyKeyStore } from "./vault/ILegacyKeyStore";
import { validatePassphrase } from "./vault/vaultPolicy";

const ENVELOPE_VERSION = 3;
const ARGON2ID_ALG = "ARGON2ID";
const ARGON2ID_PARAMS = JSON.stringify({ m_cost: 65536, t_cost: 3, p_cost: 4 });
const ARGON2ID_ENVELOPE_ITERATIONS = 0;
const MIGRATION_BATCH = 50;

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

function parseIterations(kdfParamsJson: string): number {
  try {
    const parsed = JSON.parse(kdfParamsJson) as { iterations?: unknown };
    if (typeof parsed.iterations === "number") return parsed.iterations;
  } catch {}
  throw new EncryptionError(
    "malformed_payload",
    "KDF parameters are malformed (missing iteration count).",
  );
}

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

export class VaultService implements IVaultService {
  private rawDek: Bytes | null = null;
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

  private locking = false;

  isUnlocked(): boolean {
    // lock() fires its listeners, then persists the IV high-water mark
    // (async) before the keys clear — during that gap the session keys are
    // still live, but the app must already behave as locked.
    return !this.locking && this.crypto.isUnlocked();
  }

  onLock(listener: () => void): void {
    this.lockListeners.push(listener);
  }

  async computeStatus(): Promise<VaultStatus> {
    const rec = await this.kms.get();
    if (!rec) return "uninitialized";
    return this.isUnlocked() ? "unlocked" : "locked";
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
    try {
      await this.enforceIvHighWaterMark();
    } catch (err) {
      if (this.rawDek) zeroize(this.rawDek);
      this.rawDek = null;
      this.crypto.clearSessionKeys();
      throw err;
    }
  }

  private async enforceIvHighWaterMark(): Promise<void> {
    const hwmStr = await this.readIvHighWaterMark();
    if (hwmStr == null) return;
    const hwm = Number.parseInt(hwmStr, 10);
    if (!Number.isFinite(hwm)) return;
    const current = this.crypto.getIvCounter();
    if (current < hwm) {
      Logger.warn(
        "vault: iv counter behind keychain high-water mark; fast-forwarding to avoid nonce reuse",
        undefined,
        { current, hwm },
      );
      await this.crypto.advanceCounterTo(hwm);
      await this.kms.setIvCounter(hwm).catch(() => {});
      return;
    }

    if (current > hwm) {
      await this.writeIvHighWaterMark(current).catch(() => {});
    }
  }

  private async readIvHighWaterMark(): Promise<string | null> {
    try {
      return await this.keychain.get(KEYRING_USERS.ivHighWaterMark);
    } catch (err) {
      Logger.warn("vault: iv high-water-mark read failed; skipping rewind check", err);
      return null;
    }
  }

  private async writeIvHighWaterMark(counter: number): Promise<void> {
    await this.keychain.set(KEYRING_USERS.ivHighWaterMark, String(counter));
  }

  private async resetIvHighWaterMark(): Promise<void> {
    try {
      await this.keychain.delete(KEYRING_USERS.ivHighWaterMark);
    } catch (err) {
      Logger.warn("vault: iv high-water-mark reset failed", err);
    }
  }

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
    await this.resetIvHighWaterMark();
    await this.setSessionDek(dek.rawKey, dek.cryptoKey);

    const legacyHex = this.legacyKeys.get();
    if (legacyHex) {
      try {
        await this.keychain.set(KEYRING_USERS.legacyBridge, legacyHex);
      } catch {}
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

  private async finishLegacyRun(failed: number): Promise<void> {
    if (failed === 0) {
      const remaining = await this.migrationRepo.countLegacy();
      if (remaining > 0) {
        Logger.warn(
          "vault: migration sweep finished but legacy rows remain; key retained",
          undefined,
          {
            remaining,
          },
        );
        return;
      }
      await this.kms.update({ migrationState: "complete", migrationCursor: null });
      await this.purgeLegacyKeyMaterial();
    } else {
      Logger.warn("vault: migration recorded failures; legacy key retained for retry", undefined, {
        failed,
      });
    }
  }

  private async completePendingMigration(): Promise<void> {
    const rec = await this.kms.get();
    if (!rec || rec.migrationState === "complete") return;
    let bridge: string | null = null;
    try {
      bridge = await this.keychain.get(KEYRING_USERS.legacyBridge);
    } catch (err) {
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
      const failed =
        (await this.reencryptAllNotes(oldKey, rec.migrationCursor)) +
        (await this.reencryptAllCovers(oldKey)) +
        (await this.reencryptAllTitles(oldKey)) +
        (await this.reencryptAllBlobs(oldKey));
      if (failed === 0) {
        await this.kms.update({ migrationState: "complete", migrationCursor: null });
        await this.purgeLegacyKeyMaterial();
      } else {
        Logger.warn("vault: rotation sweep recorded failures; bridge key retained", undefined, {
          failed,
        });
      }
      return;
    }

    const legacyHex = bridge ?? this.legacyKeys.get();
    if (!legacyHex) {
      if ((await this.migrationRepo.countLegacy()) === 0) {
        await this.kms.update({ migrationState: "complete", migrationCursor: null });
      } else {
        Logger.warn(
          "vault: interrupted migration but no bridge key; legacy rows left as-is",
          undefined,
          {
            migrationState: rec.migrationState,
          },
        );
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
    } catch {}
  }

  private async migrateLegacy(legacyRawKey: Bytes): Promise<number> {
    const legacyKey = await importAesGcmKey(legacyRawKey);
    const rec = await this.kms.get();
    let durable: string | null = rec?.migrationCursor ?? null;
    let sweep: string | null = durable;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findLegacyBatch(sweep, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        sweep = row.id;
        try {
          const plain = await aesGcmDecrypt(legacyKey, row.content);
          const reencrypted = await this.crypto.encryptPayload(plain, row.id);
          await this.migrationRepo.markMigrated(row.id, reencrypted);
          if (failed === 0) durable = row.id;
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          failed += 1;
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      await this.kms.update({ migrationCursor: durable });
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
        "Wrong passphrase, or vault integrity check failed (possibly tampered).",
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
    await this.resumeMigrationBestEffort();
  }

  private async resumeMigrationBestEffort(): Promise<void> {
    try {
      await this.completePendingMigration();
    } catch (err) {
      Logger.warn("vault: migration resume failed; will retry at next unlock", err);
    }
    try {
      await this.migrateTitles();
    } catch (err) {
      Logger.warn("vault: title encryption migration failed; will retry at next unlock", err);
    }
  }

  private async migrateTitles(): Promise<number> {
    let cursor: string | null = null;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findTitleBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        cursor = row.id;
        try {
          const encrypted = await this.crypto.encryptPayload(row.content, titleAad(row.id));
          await this.migrationRepo.markTitleMigrated(row.id, encrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          failed += 1;
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    }
    if (failed > 0)
      Logger.warn("vault: title encryption migration recorded failures", undefined, { failed });
    return failed;
  }

  private async reencryptAllTitles(oldKey: CryptoKey): Promise<number> {
    let cursor: string | null = null;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findAllTitlesBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        cursor = row.id;
        try {
          let plain: string;
          if (row.titleKmsVersion >= 1) {
            try {
              plain = await aesGcmDecrypt(oldKey, row.title, encodeUtf8(titleAad(row.id)));
            } catch {
              plain = await aesGcmDecrypt(oldKey, row.title);
            }
          } else {
            plain = row.title;
          }
          const reencrypted = await this.crypto.encryptPayload(plain, titleAad(row.id));
          await this.migrationRepo.markTitleMigrated(row.id, reencrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          try {
            await this.crypto.decryptPayload(row.title, titleAad(row.id));
            continue;
          } catch (err2) {
            if (isSystemicMigrationError(err2)) throw err2;
          }
          failed += 1;
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    }
    return failed;
  }

  async lock(): Promise<void> {
    while (this.unlockInFlight) {
      await this.unlockInFlight.then(
        () => {},
        () => {},
      );
    }
    this.locking = true;
    const attempt = (async () => {
      try {
        for (const listener of this.lockListeners) {
          try {
            listener();
          } catch (err) {
            Logger.warn("vault: lock listener failed", err);
          }
        }
        if (this.crypto.isUnlocked()) {
          await this.writeIvHighWaterMark(this.crypto.getIvCounter()).catch((err) =>
            Logger.warn("vault: iv high-water-mark persist on lock failed", err),
          );
        }
        if (this.rawDek) zeroize(this.rawDek);
        this.rawDek = null;
        this.crypto.clearSessionKeys();
      } finally {
        this.locking = false;
      }
    })();
    this.unlockInFlight = attempt;
    try {
      await attempt;
    } finally {
      if (this.unlockInFlight === attempt) this.unlockInFlight = null;
    }
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
      const rawDek = await this.deviceBind.unwrap(base64ToBytes(backup));
      await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));
      await this.resumeMigrationBestEffort();
      return true;
    } catch (err) {
      Logger.warn("vault: device auto-unlock failed; falling back to passphrase", err);
      return false;
    }
  }

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

    const rawDek = await this.verifyPassphraseAndUnwrap(oldPassphrase, rec);

    const env = await this.buildArgon2Envelope(newPassphrase, rawDek);
    await this.kms.update({
      kdfVersion: ENVELOPE_VERSION,
      kdfAlg: ARGON2ID_ALG,
      kdfParamsJson: ARGON2ID_PARAMS,
      saltB64: env.saltB64,
      wrappedDekLocalB64: env.wrappedB64,
      integrityMacB64: env.integrityMacB64,
    });

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
      const env = await this.buildArgon2Envelope(newPassphrase, recoveredDek);
      await this.kms.update({
        kdfVersion: ENVELOPE_VERSION,
        kdfAlg: ARGON2ID_ALG,
        kdfParamsJson: ARGON2ID_PARAMS,
        saltB64: env.saltB64,
        wrappedDekLocalB64: env.wrappedB64,
        integrityMacB64: env.integrityMacB64,
      });
      await this.setSessionDek(recoveredDek, await importAesGcmKey(recoveredDek));
      try {
        await this.writeEscrow(recoveredDek);
      } catch (err) {
        Logger.warn("vault: escrow refresh failed during recovery", err);
      }
      await this.resumeMigrationBestEffort();
      return;
    }
    await this.recoverWithDekRotation(newPassphrase, recoveredDek);
  }

  private async recoverWithDekRotation(newPassphrase: string, oldRawDek: Bytes): Promise<void> {
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
    await this.resetIvHighWaterMark();
    await this.setSessionDek(dek.rawKey, dek.cryptoKey);
    const failed =
      (await this.reencryptAllNotes(oldKey, null)) +
      (await this.reencryptAllCovers(oldKey)) +
      (await this.reencryptAllTitles(oldKey)) +
      (await this.reencryptAllBlobs(oldKey));
    if (failed === 0) {
      await this.kms.update({ migrationState: "complete", migrationCursor: null });
      await this.purgeLegacyKeyMaterial();
    } else {
      Logger.warn("vault: rotation sweep recorded failures; bridge key retained", undefined, {
        failed,
      });
    }
  }

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
            plain = await aesGcmDecrypt(oldKey, row.content);
          }
          const reencrypted = await this.crypto.encryptPayload(plain, row.id);
          await this.migrationRepo.markMigrated(row.id, reencrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          try {
            await this.crypto.decryptPayload(row.content, row.id);
            continue;
          } catch (err2) {
            if (isSystemicMigrationError(err2)) throw err2;
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

  private async reencryptAllCovers(oldKey: CryptoKey): Promise<number> {
    let cursor: string | null = null;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findAllCoverBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        cursor = row.id;
        if (!row.content) continue;
        const aad = coverAad(row.id);
        try {
          const plain = await aesGcmDecrypt(oldKey, row.content, encodeUtf8(aad));
          const reencrypted = await this.crypto.encryptPayload(plain, aad);
          await this.migrationRepo.markCoverMigrated(row.id, reencrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          try {
            await this.crypto.decryptPayload(row.content, aad);
            continue;
          } catch (err2) {
            if (isSystemicMigrationError(err2)) throw err2;
          }
          failed += 1;
          await this.migrationRepo.recordFailure(
            aad,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    }
    return failed;
  }

  private async reencryptAllBlobs(oldKey: CryptoKey): Promise<number> {
    let cursor: string | null = null;
    let failed = 0;
    for (;;) {
      const batch = await this.migrationRepo.findAllBlobBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        cursor = row.id;
        const aad = blobAad(row.id);
        try {
          const plain = await aesGcmDecryptBytes(oldKey, row.content, encodeUtf8(aad));
          const reencrypted = await this.crypto.encryptBlob(plain, aad);
          await this.migrationRepo.markBlobMigrated(row.id, reencrypted);
        } catch (err) {
          if (isSystemicMigrationError(err)) throw err;
          try {
            await this.crypto.decryptBlob(row.content as EncryptedPayload, aad);
            continue;
          } catch (err2) {
            if (isSystemicMigrationError(err2)) throw err2;
          }
          failed += 1;
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    }
    return failed;
  }
}
