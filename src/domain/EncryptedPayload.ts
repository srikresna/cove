export type EncryptedPayload = string & { readonly __encrypted: unique symbol };
