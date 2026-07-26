/**
 * A string that has passed through encryptPayload. The brand makes
 * encryption-at-rest a compile-time contract: repositories only accept
 * EncryptedPayload for note content, so plaintext cannot reach persistence
 * without going through the encryption service.
 */
export type EncryptedPayload = string & { readonly __encrypted: unique symbol };

/**
 * Stateful encryption service holding the session DEK/KEK in memory.
 *
 * Abstracted so callers depend on the interface (testable, swappable)
 * and so a locked vault (DEK == null) fails loud on any encrypt/decrypt.
 */
export interface IEncryptionService {
  isUnlocked(): boolean;
  setSessionKeys(keys: { dek: CryptoKey }): Promise<void>;
  clearSessionKeys(): void;
  encryptPayload(plaintext: string, aad: string): Promise<EncryptedPayload>;
  decryptPayload(payloadB64: string, aad: string): Promise<string>;
}
