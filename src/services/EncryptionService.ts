import { EncryptionError } from "../errors/AppError";

export class EncryptionService {
  private static masterKey: CryptoKey | null = null;

  private static async getOrGenerateMasterKey(): Promise<CryptoKey> {
    if (EncryptionService.masterKey) return EncryptionService.masterKey;

    const storageKey = "cove_device_sec_key";
    let rawHex = localStorage.getItem(storageKey);
    if (!rawHex) {
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      rawHex = Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      localStorage.setItem(storageKey, rawHex);
    }

    const matched = rawHex.match(/.{1,2}/g);
    const keyBytes = matched
      ? new Uint8Array(matched.map((byte) => Number.parseInt(byte, 16)))
      : crypto.getRandomValues(new Uint8Array(32));

    try {
      EncryptionService.masterKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
      return EncryptionService.masterKey;
    } catch (cause) {
      throw new EncryptionError("key_unavailable", "Failed to import AES master key", { cause });
    }
  }

  private static bytesToBase64(bytes: Uint8Array): string {
    let binary = "";
    const len = bytes.byteLength;
    const chunkSize = 0x8000;
    for (let i = 0; i < len; i += chunkSize) {
      const sub = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(sub));
    }
    return btoa(binary);
  }

  private static base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  static async encryptPayload(plainText: string): Promise<string> {
    if (!plainText) return "";
    let key: CryptoKey;
    try {
      key = await EncryptionService.getOrGenerateMasterKey();
    } catch (cause) {
      throw new EncryptionError("key_unavailable", "Failed to obtain key for encryption", {
        cause,
      });
    }

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    try {
      const encryptedBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      return EncryptionService.bytesToBase64(combined);
    } catch (cause) {
      throw new EncryptionError("encrypt_failed", "Failed to encrypt note payload", { cause });
    }
  }

  static async decryptPayload(encryptedBase64: string): Promise<string> {
    if (!encryptedBase64) return "";

    let combined: Uint8Array;
    try {
      combined = EncryptionService.base64ToBytes(encryptedBase64);
    } catch (cause) {
      throw new EncryptionError("malformed_payload", "Note payload is not valid base64", { cause });
    }

    if (combined.length < 13) {
      throw new EncryptionError(
        "malformed_payload",
        `Payload too short (${combined.length} bytes)`,
      );
    }

    const iv = combined.subarray(0, 12);
    const ciphertext = combined.subarray(12);

    let key: CryptoKey;
    try {
      key = await EncryptionService.getOrGenerateMasterKey();
    } catch (cause) {
      throw new EncryptionError("key_unavailable", "Failed to obtain key for decryption", {
        cause,
      });
    }

    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext),
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (cause) {
      throw new EncryptionError(
        "decrypt_failed",
        "Could not decrypt note content (wrong key or corrupted payload)",
        { cause },
      );
    }
  }
}
