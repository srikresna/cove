import type { EncryptedPayload } from "../../domain/EncryptedPayload";
import type { Bytes } from "./crypto";

export type { EncryptedPayload };

export interface IEncryptionService {
  isUnlocked(): boolean;
  setSessionKeys(keys: { dek: CryptoKey }): Promise<void>;
  clearSessionKeys(): void;
  encryptPayload(plaintext: string, aad: string): Promise<EncryptedPayload>;
  decryptPayload(payloadB64: string, aad: string): Promise<string>;
  /** Current deterministic IV counter (== persisted value once session keys are loaded). */
  getIvCounter(): number;
  /** Encrypt raw bytes (image/attachment blobs) with a random IV under the DEK. */
  encryptBlob(plaintext: Bytes, aad: string): Promise<EncryptedPayload>;
  decryptBlob(payload: EncryptedPayload, aad: string): Promise<Bytes>;
}
