import { afterEach, describe, expect, it } from "vitest";
import { EncryptionError, ValidationError } from "../errors/AppError";
import { InMemoryKeychainStore } from "../test/fakes/InMemoryKeychainStore";
import { InMemoryKmsRepository } from "../test/fakes/InMemoryKmsRepository";
import { InMemoryMigrationRepository } from "../test/fakes/InMemoryMigrationRepository";
import { VaultService } from "./VaultService";
import { CryptoVault } from "./vault/CryptoVault";
import { KEYRING_SERVICE, KEYRING_USERS } from "./vault/IKeychainStore";
import { bytesToBase64 } from "./vault/crypto";
import { aesGcmEncrypt, counterToIv, generateDek, importAesGcmKey } from "./vault/crypto";

const PW = "correct horse battery 99";
const PW2 = "new strong passphrase 22";

function makeVault() {
  const kms = new InMemoryKmsRepository();
  const keychain = new InMemoryKeychainStore();
  const migration = new InMemoryMigrationRepository();
  const crypto = new CryptoVault(kms);
  const service = new VaultService(crypto, kms, keychain, migration);
  return { kms, keychain, migration, crypto, service };
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

afterEach(() => {
  localStorage.clear();
});

describe("VaultService status", () => {
  it("reports uninitialized when no kms record exists", async () => {
    const { service } = makeVault();
    expect(await service.computeStatus()).toBe("uninitialized");
  });
});

describe("VaultService setup / unlock / lock", () => {
  it("setup unlocks, persists kms, and stores a DEK backup in the keychain", async () => {
    const { service, kms, keychain } = makeVault();
    await service.setupPassphrase(PW);

    expect(service.isUnlocked()).toBe(true);
    expect(await service.computeStatus()).toBe("unlocked");
    expect(await kms.get()).not.toBeNull();
    expect(await keychain.get(KEYRING_SERVICE, KEYRING_USERS.dekBackup)).not.toBeNull();
  });

  it("lock clears the session; the correct passphrase re-unlocks", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();

    expect(service.isUnlocked()).toBe(false);
    expect(await service.computeStatus()).toBe("locked");

    await service.unlock(PW);
    expect(service.isUnlocked()).toBe(true);
  });

  it("rejects a weak passphrase at setup", async () => {
    const { service } = makeVault();
    await expect(service.setupPassphrase("short1")).rejects.toThrow(ValidationError);
  });

  it("wrong passphrase at unlock throws EncryptionError", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();
    await expect(service.unlock("totally wrong passphrase 0")).rejects.toThrow(EncryptionError);
  });

  it("detects vault tampering via the integrity MAC", async () => {
    const { service, kms } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();

    const rec = await kms.get();
    if (!rec) throw new Error("kms record missing");
    rec.integrityMacB64 = bytesToBase64(new Uint8Array(32)); // bogus MAC
    await kms.save(rec);

    await expect(service.unlock(PW)).rejects.toThrow(EncryptionError);
  });
});

describe("VaultService legacy migration", () => {
  it("re-encrypts legacy (old-key) notes under the DEK and marks them migrated", async () => {
    const { service, migration, crypto } = makeVault();

    const legacyRaw = (await generateDek()).rawKey;
    const legacyKey = await importAesGcmKey(legacyRaw);
    const legacyHex = toHex(legacyRaw);
    const cipher = await aesGcmEncrypt(legacyKey, "legacy note body", counterToIv(1));
    migration.seed("n1", cipher);
    localStorage.setItem("cove_device_sec_key", legacyHex);

    await service.setupPassphrase(PW);

    expect(migration.isMigrated("n1")).toBe(true);
    expect(migration.contentOf("n1")).not.toBe(cipher);
    expect(await migration.countLegacy()).toBe(0);

    // Migrated content must decrypt back to the original under the session DEK.
    const plain = await crypto.decryptPayload(migration.contentOf("n1") ?? "", "n1");
    expect(plain).toBe("legacy note body");
    expect(localStorage.getItem("cove_device_sec_key")).toBeNull(); // legacy key purged
  });
});

describe("VaultService changePassphrase + recovery", () => {
  it("changePassphrase re-wraps: new passphrase unlocks, old fails", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.changePassphrase(PW, PW2);
    await service.lock();

    await expect(service.unlock(PW)).rejects.toThrow(EncryptionError);
    await service.unlock(PW2);
    expect(service.isUnlocked()).toBe(true);
  });

  it("recoverViaKeychain restores access from the keychain DEK backup", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();

    await service.recoverViaKeychain("recovered strong pw 33");
    expect(service.isUnlocked()).toBe(true);

    await service.lock();
    await service.unlock("recovered strong pw 33");
    expect(service.isUnlocked()).toBe(true);
  });
});
