import { EncryptionError, ValidationError } from "../errors/AppError";
import type { IKmsRepository, KmsRecord } from "../repositories/IKmsRepository";
import type { IMigrationRepository } from "../repositories/IMigrationRepository";
import type { IVaultService, VaultStatus } from "./IVaultService";
import type { IDeviceBind } from "./vault/IDeviceBind";
import type { IEncryptionService } from "./vault/IEncryptionService";
import { type IKeychainStore, KEYRING_SERVICE, KEYRING_USERS } from "./vault/IKeychainStore";
import {
  type Bytes,
  PBKDF2_ITERATIONS,
  aesGcmDecrypt,
  base64ToBytes,
  bytesToBase64,
  computeIntegrityMac,
  constantTimeEqual,
  deriveSubkey,
  encodeUtf8,
  generateDek,
  generateSalt,
  importAesGcmKey,
  importHmacKey,
  unwrapDek,
  wrapDek,
} from "./vault/crypto";
import { validatePassphrase } from "./vault/vaultPolicy";

const ARGON2ID_VERSION = 2;
const ARGON2ID_ALG = "ARGON2ID";
const ARGON2ID_PARAMS = JSON.stringify({ m_cost: 65536, t_cost: 3, p_cost: 4 });
const LEGACY_STORAGE_KEY = "cove_device_sec_key";
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

function parseIterations(kdfParamsJson: string): number {
  try {
    const parsed = JSON.parse(kdfParamsJson) as { iterations?: number };
    return parsed.iterations ?? PBKDF2_ITERATIONS;
  } catch {
    return PBKDF2_ITERATIONS;
  }
}

interface DerivedKeys {
  wrapKey: CryptoKey;
  macKey: CryptoKey;
}

/**
 * Orchestrates the passphrase vault: setup, unlock, lock, migration of legacy
 * notes, passphrase change, and keychain recovery. New vaults use Argon2id
 * (OWASP first-choice KDF, via Rust). Existing PBKDF2 vaults are backward-compat.
 */
export class VaultService implements IVaultService {
  private rawDek: Bytes | null = null;

  constructor(
    private readonly crypto: IEncryptionService,
    private readonly kms: IKmsRepository,
    private readonly keychain: IKeychainStore,
    private readonly migrationRepo: IMigrationRepository,
    private readonly deviceBind: IDeviceBind,
    private readonly deriveKeyFn: KdfDerive,
  ) {}

  isUnlocked(): boolean {
    return this.crypto.isUnlocked();
  }

  async computeStatus(): Promise<VaultStatus> {
    const rec = await this.kms.get();
    if (!rec) return "uninitialized";
    if (rec.migrationState === "in_progress") return "migration_in_progress";
    return this.crypto.isUnlocked() ? "unlocked" : "locked";
  }

  private async deriveKeys(
    passphrase: string,
    salt: Bytes,
    kdfAlg: string,
    kdfParamsJson: string,
  ): Promise<DerivedKeys> {
    const prk = await this.deriveKeyFn(passphrase, salt, kdfAlg, kdfParamsJson);
    const wrapKey = await importAesGcmKey(await deriveSubkey(prk, "dek-wrap"));
    const macKey = await importHmacKey(await deriveSubkey(prk, "integrity-mac"));
    return { wrapKey, macKey };
  }

  private async envelopeMac(
    macKey: CryptoKey,
    saltB64: string,
    iterations: number,
    kdfVersion: number,
    kdfAlg: string,
    wrappedDekB64: string,
  ): Promise<string> {
    const fields: Bytes[] = [
      encodeUtf8(saltB64),
      encodeUtf8(String(iterations)),
      encodeUtf8(String(kdfVersion)),
      encodeUtf8(kdfAlg),
      encodeUtf8(wrappedDekB64),
    ];
    return bytesToBase64(await computeIntegrityMac(macKey, fields));
  }

  private async setSessionDek(rawDek: Bytes, cryptoKey: CryptoKey): Promise<void> {
    this.rawDek = rawDek;
    await this.crypto.setSessionKeys({ dek: cryptoKey });
  }

  async setupPassphrase(passphrase: string): Promise<void> {
    const check = validatePassphrase(passphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid passphrase");

    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(
      passphrase,
      salt,
      ARGON2ID_ALG,
      ARGON2ID_PARAMS,
    );
    const dek = await generateDek();
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, dek.rawKey));
    const integrityMacB64 = await this.envelopeMac(
      macKey,
      saltB64,
      0,
      ARGON2ID_VERSION,
      ARGON2ID_ALG,
      wrappedB64,
    );

    const now = Date.now();
    const rec: KmsRecord = {
      kdfVersion: ARGON2ID_VERSION,
      kdfAlg: ARGON2ID_ALG,
      kdfParamsJson: ARGON2ID_PARAMS,
      saltB64,
      ivCounter: 0,
      wrappedDekLocalB64: wrappedB64,
      integrityMacB64,
      migrationState: "pending_migration",
      migrationCursor: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.kms.save(rec);
    await this.setSessionDek(dek.rawKey, dek.cryptoKey);

    const wrappedDek = await this.deviceBind.wrap(dek.rawKey);
    await this.keychain.set(KEYRING_SERVICE, KEYRING_USERS.dekBackup, bytesToBase64(wrappedDek));

    const legacyHex = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyHex) {
      try {
        await this.keychain.set(KEYRING_SERVICE, KEYRING_USERS.legacyBridge, legacyHex);
      } catch {
        /* best-effort */
      }
      await this.migrateLegacy(hexToBytes(legacyHex));
    }
    await this.kms.update({ migrationState: "complete", migrationCursor: null });
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    try {
      await this.keychain.delete(KEYRING_SERVICE, KEYRING_USERS.legacyBridge);
    } catch {
      /* ignore */
    }
  }

  private async migrateLegacy(legacyRawKey: Bytes): Promise<void> {
    const legacyKey = await importAesGcmKey(legacyRawKey);
    let cursor: string | null = null;
    for (;;) {
      const batch = await this.migrationRepo.findLegacyBatch(cursor, MIGRATION_BATCH);
      if (batch.length === 0) break;
      for (const row of batch) {
        try {
          const plain = await aesGcmDecrypt(legacyKey, row.content);
          const reencrypted = await this.crypto.encryptPayload(plain, row.id);
          await this.migrationRepo.markMigrated(row.id, reencrypted);
        } catch (err) {
          await this.migrationRepo.recordFailure(
            row.id,
            err instanceof Error ? err.message : String(err),
          );
        }
        cursor = row.id;
      }
      await this.kms.update({ migrationCursor: cursor });
    }
  }

  async unlock(passphrase: string): Promise<void> {
    const rec = await this.kms.get();
    if (!rec) throw new ValidationError("Vault is not initialized yet.");
    const iterations = rec.kdfAlg === "ARGON2ID" ? 0 : parseIterations(rec.kdfParamsJson);
    const { wrapKey, macKey } = await this.deriveKeys(
      passphrase,
      base64ToBytes(rec.saltB64),
      rec.kdfAlg,
      rec.kdfParamsJson,
    );

    const expectedMac = await this.envelopeMac(
      macKey,
      rec.saltB64,
      iterations,
      rec.kdfVersion,
      rec.kdfAlg,
      rec.wrappedDekLocalB64 ?? "",
    );
    if (!constantTimeEqual(base64ToBytes(rec.integrityMacB64), base64ToBytes(expectedMac))) {
      throw new EncryptionError(
        "decrypt_failed",
        "Vault integrity check failed (possibly tampered).",
      );
    }

    const wrappedB64 =
      rec.wrappedDekLocalB64 ?? (await this.keychain.get(KEYRING_SERVICE, KEYRING_USERS.dekBackup));
    if (!wrappedB64) {
      throw new EncryptionError(
        "key_unavailable",
        "No wrapped DEK available; recovery impossible.",
      );
    }
    let rawDek: Bytes;
    try {
      rawDek = await unwrapDek(wrapKey, base64ToBytes(wrappedB64));
    } catch (cause) {
      throw new EncryptionError("decrypt_failed", "Wrong passphrase.", { cause });
    }
    await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));
  }

  lock(): Promise<void> {
    this.rawDek = null;
    this.crypto.clearSessionKeys();
    return Promise.resolve();
  }

  async tryAutoUnlock(): Promise<boolean> {
    const rec = await this.kms.get();
    if (!rec) return false;
    const backup = await this.keychain.get(KEYRING_SERVICE, KEYRING_USERS.dekBackup);
    if (!backup) return false;
    try {
      const wrapped = base64ToBytes(backup);
      let rawDek: Bytes;
      try {
        rawDek = await this.deviceBind.unwrap(wrapped);
      } catch {
        rawDek = wrapped;
      }
      await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));
      return true;
    } catch {
      return false;
    }
  }

  async changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<void> {
    await this.unlock(oldPassphrase);
    if (!this.rawDek)
      throw new EncryptionError("key_unavailable", "DEK not available for re-wrap.");
    const check = validatePassphrase(newPassphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid new passphrase");

    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(
      newPassphrase,
      salt,
      ARGON2ID_ALG,
      ARGON2ID_PARAMS,
    );
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, this.rawDek));
    const integrityMacB64 = await this.envelopeMac(
      macKey,
      saltB64,
      0,
      ARGON2ID_VERSION,
      ARGON2ID_ALG,
      wrappedB64,
    );

    const existing = await this.kms.get();
    if (!existing) throw new EncryptionError("key_unavailable", "Vault not initialized.");
    const updated: KmsRecord = {
      ...existing,
      kdfVersion: ARGON2ID_VERSION,
      kdfAlg: ARGON2ID_ALG,
      saltB64,
      kdfParamsJson: ARGON2ID_PARAMS,
      wrappedDekLocalB64: wrappedB64,
      integrityMacB64,
      updatedAt: Date.now(),
    };
    await this.kms.save(updated);
    const rewrapped = await this.deviceBind.wrap(this.rawDek);
    await this.keychain.set(KEYRING_SERVICE, KEYRING_USERS.dekBackup, bytesToBase64(rewrapped));
  }

  async recoverViaKeychain(newPassphrase: string): Promise<void> {
    const backupB64 = await this.keychain.get(KEYRING_SERVICE, KEYRING_USERS.dekBackup);
    if (!backupB64) {
      throw new EncryptionError("key_unavailable", "No keychain backup; recovery impossible.");
    }
    const check = validatePassphrase(newPassphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid passphrase");

    const rawDek = await this.deviceBind.unwrap(base64ToBytes(backupB64));
    await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));

    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(
      newPassphrase,
      salt,
      ARGON2ID_ALG,
      ARGON2ID_PARAMS,
    );
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, rawDek));
    const integrityMacB64 = await this.envelopeMac(
      macKey,
      saltB64,
      0,
      ARGON2ID_VERSION,
      ARGON2ID_ALG,
      wrappedB64,
    );

    const existing = await this.kms.get();
    const rec: KmsRecord = existing
      ? {
          ...existing,
          kdfVersion: ARGON2ID_VERSION,
          kdfAlg: ARGON2ID_ALG,
          saltB64,
          kdfParamsJson: ARGON2ID_PARAMS,
          wrappedDekLocalB64: wrappedB64,
          integrityMacB64,
          updatedAt: Date.now(),
        }
      : {
          kdfVersion: ARGON2ID_VERSION,
          kdfAlg: ARGON2ID_ALG,
          kdfParamsJson: ARGON2ID_PARAMS,
          saltB64,
          ivCounter: 0,
          wrappedDekLocalB64: wrappedB64,
          integrityMacB64,
          migrationState: "complete",
          migrationCursor: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
    await this.kms.save(rec);
  }
}
