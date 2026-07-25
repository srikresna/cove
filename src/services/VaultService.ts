import { EncryptionError, ValidationError } from "../errors/AppError";
import type { IKmsRepository, KmsRecord } from "../repositories/IKmsRepository";
import type { IMigrationRepository } from "../repositories/IMigrationRepository";
import type { IVaultService, VaultStatus } from "./IVaultService";
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
  derivePrk,
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

const KDF_VERSION = 1;
const KDF_ALG = "PBKDF2-SHA256";
const LEGACY_STORAGE_KEY = "cove_device_sec_key";
const MIGRATION_BATCH = 50;

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
 * notes, passphrase change, and keychain recovery. Holds the raw DEK in memory
 * for the session so it can be re-wrapped (e.g. on passphrase change) without
 * ever persisting it; cleared on lock. See docs/CRYPTO_VAULT_BLUEPRINT.md.
 */
export class VaultService implements IVaultService {
  private rawDek: Bytes | null = null;

  constructor(
    private readonly crypto: IEncryptionService,
    private readonly kms: IKmsRepository,
    private readonly keychain: IKeychainStore,
    private readonly migrationRepo: IMigrationRepository,
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
    iterations: number,
  ): Promise<DerivedKeys> {
    const prk = await derivePrk(passphrase, salt, iterations);
    const wrapKey = await importAesGcmKey(await deriveSubkey(prk, "dek-wrap"));
    const macKey = await importHmacKey(await deriveSubkey(prk, "integrity-mac"));
    return { wrapKey, macKey };
  }

  private async envelopeMac(
    macKey: CryptoKey,
    saltB64: string,
    iterations: number,
    wrappedDekB64: string,
  ): Promise<string> {
    const fields: Bytes[] = [
      encodeUtf8(saltB64),
      encodeUtf8(String(iterations)),
      encodeUtf8(String(KDF_VERSION)),
      encodeUtf8(KDF_ALG),
      encodeUtf8(wrappedDekB64),
    ];
    return bytesToBase64(await computeIntegrityMac(macKey, fields));
  }

  private async setSessionDek(rawDek: Bytes, cryptoKey: CryptoKey): Promise<void> {
    this.rawDek = rawDek;
    this.crypto.setSessionKeys({ dek: cryptoKey });
  }

  async setupPassphrase(passphrase: string): Promise<void> {
    const check = validatePassphrase(passphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid passphrase");

    const iterations = PBKDF2_ITERATIONS;
    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(passphrase, salt, iterations);
    const dek = await generateDek();
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, dek.rawKey));
    const integrityMacB64 = await this.envelopeMac(macKey, saltB64, iterations, wrappedB64);

    const now = Date.now();
    const rec: KmsRecord = {
      kdfVersion: KDF_VERSION,
      kdfAlg: KDF_ALG,
      kdfParamsJson: JSON.stringify({ iterations }),
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

    // Recovery backup (accepted threat model: raw DEK in OS keychain; trusted-device recovery).
    await this.keychain.set(KEYRING_SERVICE, KEYRING_USERS.dekBackup, bytesToBase64(dek.rawKey));

    // Bridge + migrate any legacy (old per-device-key) notes, then purge the legacy key.
    const legacyHex = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyHex) {
      try {
        await this.keychain.set(KEYRING_SERVICE, KEYRING_USERS.legacyBridge, legacyHex);
      } catch {
        /* bridge is best-effort; local fallback still has the key until purged */
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
          const reencrypted = await this.crypto.encryptPayload(plain);
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
    const iterations = parseIterations(rec.kdfParamsJson);
    const { wrapKey, macKey } = await this.deriveKeys(
      passphrase,
      base64ToBytes(rec.saltB64),
      iterations,
    );

    const expectedMac = await this.envelopeMac(
      macKey,
      rec.saltB64,
      iterations,
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

  async changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<void> {
    await this.unlock(oldPassphrase); // verifies old passphrase + installs DEK
    if (!this.rawDek)
      throw new EncryptionError("key_unavailable", "DEK not available for re-wrap.");
    const check = validatePassphrase(newPassphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid new passphrase");

    const iterations = PBKDF2_ITERATIONS;
    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(newPassphrase, salt, iterations);
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, this.rawDek));
    const integrityMacB64 = await this.envelopeMac(macKey, saltB64, iterations, wrappedB64);

    const existing = await this.kms.get();
    if (!existing) throw new EncryptionError("key_unavailable", "Vault not initialized.");
    const updated: KmsRecord = {
      ...existing,
      saltB64,
      kdfParamsJson: JSON.stringify({ iterations }),
      wrappedDekLocalB64: wrappedB64,
      integrityMacB64,
      updatedAt: Date.now(),
    };
    await this.kms.save(updated);
    await this.keychain.set(KEYRING_SERVICE, KEYRING_USERS.dekBackup, bytesToBase64(this.rawDek));
  }

  async recoverViaKeychain(newPassphrase: string): Promise<void> {
    const backupB64 = await this.keychain.get(KEYRING_SERVICE, KEYRING_USERS.dekBackup);
    if (!backupB64) {
      throw new EncryptionError("key_unavailable", "No keychain backup; recovery impossible.");
    }
    const check = validatePassphrase(newPassphrase);
    if (!check.ok) throw new ValidationError(check.error ?? "Invalid passphrase");

    const rawDek = base64ToBytes(backupB64);
    await this.setSessionDek(rawDek, await importAesGcmKey(rawDek));

    const iterations = PBKDF2_ITERATIONS;
    const salt = generateSalt();
    const saltB64 = bytesToBase64(salt);
    const { wrapKey, macKey } = await this.deriveKeys(newPassphrase, salt, iterations);
    const wrappedB64 = bytesToBase64(await wrapDek(wrapKey, rawDek));
    const integrityMacB64 = await this.envelopeMac(macKey, saltB64, iterations, wrappedB64);

    const existing = await this.kms.get();
    const rec: KmsRecord = existing
      ? {
          ...existing,
          saltB64,
          kdfParamsJson: JSON.stringify({ iterations }),
          wrappedDekLocalB64: wrappedB64,
          integrityMacB64,
          updatedAt: Date.now(),
        }
      : {
          kdfVersion: KDF_VERSION,
          kdfAlg: KDF_ALG,
          kdfParamsJson: JSON.stringify({ iterations }),
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
