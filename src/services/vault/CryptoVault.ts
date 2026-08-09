import { EncryptionError } from "../../errors/AppError";
import type { IKmsRepository } from "../../repositories/IKmsRepository";
import {
  aesGcmDecrypt,
  aesGcmDecryptBytes,
  aesGcmEncrypt,
  aesGcmEncryptBytes,
  type Bytes,
  counterToIv,
  encodeUtf8,
  IV_EXHAUSTION_LIMIT,
} from "./crypto";
import type { EncryptedPayload, IEncryptionService } from "./IEncryptionService";

export class CryptoVault implements IEncryptionService {
  private dek: CryptoKey | null = null;
  private ivCounter = 0;

  constructor(private readonly kms: IKmsRepository) {}

  isUnlocked(): boolean {
    return this.dek !== null;
  }

  getIvCounter(): number {
    return this.ivCounter;
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

  async encryptBlob(plaintext: Bytes, aad: string): Promise<EncryptedPayload> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot encrypt.");
    }
    // Random IV per blob (not the deterministic counter) — see crypto.aesGcmEncryptBytes.
    return (await aesGcmEncryptBytes(this.dek, plaintext, encodeUtf8(aad))) as EncryptedPayload;
  }

  async decryptBlob(payload: EncryptedPayload, aad: string): Promise<Bytes> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot decrypt.");
    }
    try {
      return await aesGcmDecryptBytes(this.dek, payload, encodeUtf8(aad));
    } catch (cause) {
      throw new EncryptionError("decrypt_failed", "Could not decrypt blob.", { cause });
    }
  }
}
