import { EncryptionError } from "../../errors/AppError";
import type { IKmsRepository } from "../../repositories/IKmsRepository";
import type { EncryptedPayload, IEncryptionService } from "./IEncryptionService";
import {
  IV_EXHAUSTION_LIMIT,
  aesGcmDecrypt,
  aesGcmEncrypt,
  counterToIv,
  encodeUtf8,
} from "./crypto";

export class CryptoVault implements IEncryptionService {
  private dek: CryptoKey | null = null;
  private ivCounter = 0;

  constructor(private readonly kms: IKmsRepository) {}

  isUnlocked(): boolean {
    return this.dek !== null;
  }

  async setSessionKeys(keys: { dek: CryptoKey }): Promise<void> {
    this.dek = keys.dek;
    const rec = await this.kms.get();
    this.ivCounter = rec?.ivCounter ?? 0;
  }

  clearSessionKeys(): void {
    this.dek = null;
    this.ivCounter = 0;
  }

  async encryptPayload(plaintext: string, aad: string): Promise<EncryptedPayload> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot encrypt.");
    }
    // Synchronous increment => unique per call (single-threaded JS, no interleave).
    this.ivCounter += 1;
    const counter = this.ivCounter;
    if (counter >= IV_EXHAUSTION_LIMIT) {
      throw new EncryptionError(
        "iv_exhausted",
        "IV counter exhausted; DEK rotation required before more encryptions.",
      );
    }
    // Persisted BEFORE use (single autocommit UPDATE — tauri-plugin-sql's pool
    // breaks multi-statement transactions), so a crash can never lower the
    // counter below an IV already emitted.
    await this.kms.setIvCounter(counter);
    const payload = await aesGcmEncrypt(this.dek, plaintext, counterToIv(counter), encodeUtf8(aad));
    return payload as EncryptedPayload;
  }

  async decryptPayload(payloadB64: string, aad: string): Promise<string> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot decrypt.");
    }
    if (!payloadB64) return "";
    try {
      return await aesGcmDecrypt(this.dek, payloadB64, encodeUtf8(aad));
    } catch {
      // Pre-AAD ciphertexts (migrated before AAD binding) carry no additionalData.
      try {
        return await aesGcmDecrypt(this.dek, payloadB64);
      } catch (cause) {
        throw new EncryptionError(
          "decrypt_failed",
          "Could not decrypt note content (wrong key, wrong AAD, or corrupted payload).",
          { cause },
        );
      }
    }
  }
}
