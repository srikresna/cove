export type EncryptedPayload = string & { readonly __encrypted: unique symbol };

export interface IEncryptionService {
  isUnlocked(): boolean;
  setSessionKeys(keys: { dek: CryptoKey }): Promise<void>;
  clearSessionKeys(): void;
  encryptPayload(plaintext: string, aad: string): Promise<EncryptedPayload>;
  decryptPayload(payloadB64: string, aad: string): Promise<string>;
}
