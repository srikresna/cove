/**
 * A string known to hold AES-GCM ciphertext (IV ‖ tag ‖ ct, base64). The brand
 * makes it impossible to accidentally persist or pass plaintext where ciphertext
 * is expected. Lives in the domain/shared kernel so both the repository layer and
 * the encryption service depend on it without a layering inversion.
 */
export type EncryptedPayload = string & { readonly __encrypted: unique symbol };
