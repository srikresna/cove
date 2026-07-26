import { describe, expect, it } from "vitest";
import { EncryptionError, ValidationError } from "../errors/AppError";
import { IdentityDeviceBind } from "../test/fakes/IdentityDeviceBind";
import { InMemoryKeychainStore } from "../test/fakes/InMemoryKeychainStore";
import { InMemoryKmsRepository } from "../test/fakes/InMemoryKmsRepository";
import { InMemoryLegacyKeyStore } from "../test/fakes/InMemoryLegacyKeyStore";
import { InMemoryMigrationRepository } from "../test/fakes/InMemoryMigrationRepository";
import { type KdfDerive, VaultService } from "./VaultService";
import { CryptoVault } from "./vault/CryptoVault";
import type { IDeviceBind } from "./vault/IDeviceBind";
import { KEYRING_USERS } from "./vault/IKeychainStore";
import {
  type Bytes,
  aesGcmEncrypt,
  bytesToBase64,
  counterToIv,
  derivePrk,
  encodeUtf8,
  generateDek,
  importAesGcmKey,
} from "./vault/crypto";

const PW = "correct horse battery 99";
const PW2 = "new strong passphrase 22";

function makeVault(overrides: { deviceBind?: IDeviceBind } = {}) {
  const kms = new InMemoryKmsRepository();
  const keychain = new InMemoryKeychainStore();
  const migration = new InMemoryMigrationRepository();
  const legacyKeys = new InMemoryLegacyKeyStore();
  const crypto = new CryptoVault(kms);
  const deviceBind = overrides.deviceBind ?? new IdentityDeviceBind();
  const deriveKeyFn: KdfDerive = async (passphrase, salt) => derivePrk(passphrase, salt, 1_000);
  const service = new VaultService(
    crypto,
    kms,
    keychain,
    migration,
    deviceBind,
    deriveKeyFn,
    legacyKeys,
  );
  return { kms, keychain, migration, legacyKeys, crypto, service };
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

class PrefixDeviceBind implements IDeviceBind {
  async wrap(plaintext: Bytes): Promise<Bytes> {
    const out = new Uint8Array(plaintext.byteLength + 1);
    out[0] = 0xd7;
    out.set(plaintext, 1);
    return out;
  }
  async unwrap(ciphertext: Bytes): Promise<Bytes> {
    if (ciphertext[0] !== 0xd7) throw new Error("blob is not device-wrapped");
    return new Uint8Array(ciphertext.subarray(1));
  }
}

describe("VaultService status", () => {
  it("reports uninitialized when no kms record exists", async () => {
    const { service } = makeVault();
    expect(await service.computeStatus()).toBe("uninitialized");
  });
});

describe("VaultService setup / unlock / lock", () => {
  it("setup unlocks and persists kms, but does NOT escrow the DEK by default", async () => {
    const { service, kms, keychain } = makeVault();
    await service.setupPassphrase(PW);

    expect(service.isUnlocked()).toBe(true);
    expect(await service.computeStatus()).toBe("unlocked");
    expect(await kms.get()).not.toBeNull();
    expect(await keychain.get(KEYRING_USERS.dekBackup)).toBeNull();
  });

  it("setup on an already-initialized vault throws instead of orphaning notes", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await expect(service.setupPassphrase(PW2)).rejects.toThrow(ValidationError);
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

  it("notifies onLock listeners on every lock", async () => {
    const { service } = makeVault();
    let fired = 0;
    service.onLock(() => {
      fired += 1;
    });
    await service.setupPassphrase(PW);
    await service.lock();
    await service.unlock(PW);
    await service.lock();
    expect(fired).toBe(2);
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
    rec.integrityMacB64 = bytesToBase64(new Uint8Array(32));
    await kms.save(rec);

    await expect(service.unlock(PW)).rejects.toThrow(EncryptionError);
  });

  it("detects tampering of the stored KDF params (v3 envelope binds them)", async () => {
    const { service, kms } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();

    const rec = await kms.get();
    if (!rec) throw new Error("kms record missing");
    rec.kdfParamsJson = JSON.stringify({ m_cost: 8, t_cost: 1, p_cost: 1 });
    await kms.save(rec);

    await expect(service.unlock(PW)).rejects.toThrow(EncryptionError);
  });

  it("serializes concurrent unlocks — each passphrase is verified individually", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();

    const good = service.unlock(PW);
    const bad = service.unlock("wrong passphrase 1234");
    await expect(good).resolves.toBeUndefined();
    await expect(bad).rejects.toThrow(EncryptionError);
    expect(service.isUnlocked()).toBe(true);
  });
});

describe("VaultService legacy migration", () => {
  it("re-encrypts legacy (old-key) notes under the DEK and marks them migrated", async () => {
    const { service, migration, crypto, legacyKeys, keychain } = makeVault();

    const legacyRaw = (await generateDek()).rawKey;
    const legacyKey = await importAesGcmKey(legacyRaw);
    const cipher = await aesGcmEncrypt(legacyKey, "legacy note body", counterToIv(1));
    migration.seed("n1", cipher);
    legacyKeys.seed(toHex(legacyRaw));

    await service.setupPassphrase(PW);

    expect(migration.isMigrated("n1")).toBe(true);
    expect(migration.contentOf("n1")).not.toBe(cipher);
    expect(await migration.countLegacy()).toBe(0);

    const plain = await crypto.decryptPayload(migration.contentOf("n1") ?? "", "n1");
    expect(plain).toBe("legacy note body");
    expect(legacyKeys.get()).toBeNull();
    expect(await keychain.get(KEYRING_USERS.legacyBridge)).toBeNull();
  });

  it("resumes an interrupted migration at the next unlock (crash-safe)", async () => {
    const { service, kms, keychain, migration, crypto } = makeVault();
    await service.setupPassphrase(PW);

    const legacyRaw = (await generateDek()).rawKey;
    const legacyKey = await importAesGcmKey(legacyRaw);
    const cipher = await aesGcmEncrypt(legacyKey, "stranded body", counterToIv(1));
    migration.seed("n2", cipher);
    await kms.update({ migrationState: "in_progress" });
    await keychain.set(KEYRING_USERS.legacyBridge, toHex(legacyRaw));
    await service.lock();

    expect(await service.computeStatus()).toBe("locked");

    await service.unlock(PW);
    expect(migration.isMigrated("n2")).toBe(true);
    expect((await kms.get())?.migrationState).toBe("complete");
    expect(await keychain.get(KEYRING_USERS.legacyBridge)).toBeNull();
    const plain = await crypto.decryptPayload(migration.contentOf("n2") ?? "", "n2");
    expect(plain).toBe("stranded body");
  });

  it("marks an interrupted migration complete when no legacy rows remain and no bridge exists", async () => {
    const { service, kms } = makeVault();
    await service.setupPassphrase(PW);
    await kms.update({ migrationState: "in_progress" });
    await service.lock();

    await service.unlock(PW);
    expect((await kms.get())?.migrationState).toBe("complete");
  });

  it("retains the legacy key and resumable state when a row fails to migrate", async () => {
    const { service, migration, legacyKeys, keychain, kms } = makeVault();

    const legacyRaw = (await generateDek()).rawKey;
    const legacyKey = await importAesGcmKey(legacyRaw);
    const good = await aesGcmEncrypt(legacyKey, "healthy body", counterToIv(1));
    migration.seed("n-good", good);
    migration.seed("n-corrupt", "definitely-not-valid-ciphertext");
    legacyKeys.seed(toHex(legacyRaw));

    await service.setupPassphrase(PW);

    expect(migration.isMigrated("n-good")).toBe(true);
    expect(migration.isMigrated("n-corrupt")).toBe(false);
    expect((await kms.get())?.migrationState).toBe("in_progress");
    expect(await keychain.get(KEYRING_USERS.legacyBridge)).toBe(toHex(legacyRaw));
  });
});

describe("VaultService keychain escrow (Trust this device)", () => {
  it("setKeychainEscrow stores / deletes the device-wrapped DEK", async () => {
    const { service, keychain } = makeVault();
    await service.setupPassphrase(PW);

    await service.setKeychainEscrow(true);
    expect(await keychain.get(KEYRING_USERS.dekBackup)).not.toBeNull();

    await service.setKeychainEscrow(false);
    expect(await keychain.get(KEYRING_USERS.dekBackup)).toBeNull();
  });

  it("refuses to enable escrow while locked", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();
    await expect(service.setKeychainEscrow(true)).rejects.toThrow(EncryptionError);
  });

  it("tryAutoUnlock works only when escrow exists", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();
    expect(await service.tryAutoUnlock()).toBe(false);

    await service.unlock(PW);
    await service.setKeychainEscrow(true);
    await service.lock();
    expect(await service.tryAutoUnlock()).toBe(true);
  });

  it("tryAutoUnlock rejects a raw (non-device-wrapped) keychain blob", async () => {
    const { service, keychain } = makeVault({ deviceBind: new PrefixDeviceBind() });
    await service.setupPassphrase(PW);
    await service.setKeychainEscrow(true);
    await service.lock();
    expect(await service.tryAutoUnlock()).toBe(true);

    await service.lock();
    await keychain.set(KEYRING_USERS.dekBackup, bytesToBase64(new Uint8Array(32)));
    expect(await service.tryAutoUnlock()).toBe(false);
    expect(service.isUnlocked()).toBe(false);
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

  it("changePassphrase verifies the old passphrase even when already unlocked", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await expect(service.changePassphrase("not the old pass 77", PW2)).rejects.toThrow(
      EncryptionError,
    );
    await service.lock();
    await service.unlock(PW);
    expect(service.isUnlocked()).toBe(true);
  });

  it("recoverViaKeychain restores access from the escrowed DEK (same DEK, ivCounter preserved)", async () => {
    const { service, crypto, kms } = makeVault();
    await service.setupPassphrase(PW);
    await service.setKeychainEscrow(true);
    const cipher = await crypto.encryptPayload("keep me readable", "n1");
    const counterBefore = (await kms.get())?.ivCounter ?? 0;
    await service.lock();

    await service.recoverViaKeychain("recovered strong pw 33");
    expect(service.isUnlocked()).toBe(true);
    expect(await crypto.decryptPayload(cipher, "n1")).toBe("keep me readable");
    expect((await kms.get())?.ivCounter ?? 0).toBeGreaterThanOrEqual(counterBefore);

    await service.lock();
    await service.unlock("recovered strong pw 33");
    expect(service.isUnlocked()).toBe(true);
  });

  it("recoverViaKeychain fails without escrow", async () => {
    const { service } = makeVault();
    await service.setupPassphrase(PW);
    await service.lock();
    await expect(service.recoverViaKeychain(PW2)).rejects.toThrow(EncryptionError);
  });

  it("rotates the DEK (fresh IV space) when the kms row is missing, re-encrypting all notes", async () => {
    const { service, kms, keychain, migration, crypto } = makeVault();
    await service.setupPassphrase(PW);
    await service.setKeychainEscrow(true);
    const oldCipher = await crypto.encryptPayload("rotate me", "n1");
    migration.seed("n1", oldCipher);

    kms.clear();
    await service.lock();
    await service.recoverViaKeychain(PW2);

    expect(service.isUnlocked()).toBe(true);
    const rec = await kms.get();
    expect(rec).not.toBeNull();
    const rotated = migration.contentOf("n1") ?? "";
    expect(rotated).not.toBe(oldCipher);
    expect(await crypto.decryptPayload(rotated, "n1")).toBe("rotate me");
    expect(rec?.ivCounter ?? 0).toBeGreaterThan(0);
    expect(await keychain.get(KEYRING_USERS.dekBackup)).not.toBeNull();
    expect(await keychain.get(KEYRING_USERS.legacyBridge)).toBeNull();

    await service.lock();
    await service.unlock(PW2);
    expect(service.isUnlocked()).toBe(true);
  });

  it("resumes an interrupted DEK rotation at the next unlock", async () => {
    const { service, kms, keychain, migration, crypto } = makeVault();
    await service.setupPassphrase(PW);
    await service.setKeychainEscrow(true);

    const oldDek = await generateDek();
    const oldCipher = await aesGcmEncrypt(
      oldDek.cryptoKey,
      "unswept body",
      counterToIv(9),
      encodeUtf8("n-old"),
    );
    migration.seed("n-old", oldCipher);
    const alreadyRotated = await crypto.encryptPayload("already rotated", "n-done");
    migration.seed("n-done", alreadyRotated);
    await keychain.set(KEYRING_USERS.legacyBridge, bytesToBase64(oldDek.rawKey));
    await kms.update({ migrationState: "rotation_in_progress" });
    await service.lock();

    await service.unlock(PW);

    expect(await crypto.decryptPayload(migration.contentOf("n-old") ?? "", "n-old")).toBe(
      "unswept body",
    );
    expect(migration.contentOf("n-done")).toBe(alreadyRotated);
    expect((await kms.get())?.migrationState).toBe("complete");
    expect(await keychain.get(KEYRING_USERS.legacyBridge)).toBeNull();
  });
});
