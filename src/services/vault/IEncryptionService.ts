/**
 * Stateful encryption service holding the session DEK/KEK in memory.
 *
 * Abstracted so the repository depends on the interface (testable, swappable)
 * and so a locked vault (DEK == null) fails loud on any encrypt/decrypt.
 */
export interface IEncryptionService {
  isUnlocked(): boolean;
  setSessionKeys(keys: { dek: CryptoKey }): Promise<void>;
  clearSessionKeys(): void;
  encryptPayload(plaintext: string, aad: string): Promise<string>;
  decryptPayload(payloadB64: string, aad: string): Promise<string>;
}
