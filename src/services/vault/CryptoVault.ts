import { EncryptionError } from "../../errors/AppError";
import type { IKmsRepository } from "../../repositories/IKmsRepository";
import type { IEncryptionService } from "./IEncryptionService";
import { aesGcmDecrypt, aesGcmEncrypt, counterToIv } from "./crypto";

/**
 * Holds the session DEK (encrypts note content) in memory only. The DEK is a
 * non-extractable CryptoKey; never serialized; cleared on lock/app-close.
 *
 * IV strategy: a per-DEK monotonic counter held in memory, loaded from kms on
 * unlock and persisted (single-statement UPDATE, BEFORE use) on every encrypt.
 * The counter increment is synchronous, so under JS's single-threaded model two
 * concurrent encrypts can never obtain the same counter (no AES-GCM IV reuse).
 * We deliberately do NOT use BEGIN/COMMIT — tauri-plugin-sql's sqlx pool may
 * route each statement to a different connection, breaking multi-call txns.
 * (NIST SP 800-38D §8.2.1 deterministic-IV mode.)
 */
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

  async encryptPayload(plaintext: string): Promise<string> {
    if (!this.dek) {
      throw new EncryptionError("key_unavailable", "Vault is locked; cannot encrypt.");
    }
    // Synchronous increment => unique per call (single-threaded JS, no interleave).
    this.ivCounter += 1;
    const counter = this.ivCounter;
    // Persist BEFORE use so a crash can never lower the counter below an IV already emitted.
    await this.kms.setIvCounter(counter);
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
