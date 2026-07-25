import { EncryptionError } from "../../errors/AppError";
import type { IKmsRepository } from "../../repositories/IKmsRepository";
import type { IEncryptionService } from "./IEncryptionService";
import { aesGcmDecrypt, aesGcmEncrypt, counterToIv } from "./crypto";

/**
 * Holds the session DEK (encrypts note content) and KEK in memory only.
 * The DEK is a non-extractable CryptoKey; it is never serialized and is cleared
 * on lock/app-close. encryptPayload derives a deterministic IV from the persisted
 * monotonic per-DEK counter (kms.incrementIvCounter) — NIST SP 800-38D §8.2.1,
 * which rules out catastrophic AES-GCM IV reuse over the vault lifetime.
 */
export class CryptoVault implements IEncryptionService {
  private dek: CryptoKey | null = null;

  constructor(private readonly kms: IKmsRepository) {}

  isUnlocked(): boolean {
    return this.dek !== null;
  }

  setSessionKeys(keys: { dek: CryptoKey }): void {
    this.dek = keys.dek;
  }

  clearSessionKeys(): void {
    this.dek = null;
  }

  async encryptPayload(plaintext: string): Promise<string> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot encrypt.");
    }
    const counter = await this.kms.incrementIvCounter();
    return aesGcmEncrypt(this.dek, plaintext, counterToIv(counter));
  }

  async decryptPayload(payloadB64: string): Promise<string> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot decrypt.");
    }
    if (!payloadB64) return "";
    try {
      return await aesGcmDecrypt(this.dek, payloadB64);
    } catch (cause) {
      throw new EncryptionError(
        "decrypt_failed",
        "Could not decrypt note content (wrong key or corrupted payload).",
        { cause },
      );
    }
  }
}
