import { describe, expect, it } from "vitest";
import { EncryptionError } from "../errors/AppError";
import { EncryptionService } from "./EncryptionService";

describe("EncryptionService", () => {
  it("encrypts and decrypts UTF-8 text correctly", async () => {
    const plain = "Hello Cove Notes 🚀 - Enkripsi Indonesia!";
    const encrypted = await EncryptionService.encryptPayload(plain);

    expect(encrypted).not.toBe(plain);
    expect(encrypted.length).toBeGreaterThan(20);

    const decrypted = await EncryptionService.decryptPayload(encrypted);
    expect(decrypted).toBe(plain);
  });

  it("produces unique ciphertexts for identical plaintext due to random IV", async () => {
    const plain = "Same content";
    const enc1 = await EncryptionService.encryptPayload(plain);
    const enc2 = await EncryptionService.encryptPayload(plain);

    expect(enc1).not.toBe(enc2);

    const dec1 = await EncryptionService.decryptPayload(enc1);
    const dec2 = await EncryptionService.decryptPayload(enc2);
    expect(dec1).toBe(plain);
    expect(dec2).toBe(plain);
  });

  it("throws EncryptionError for malformed base64 input", async () => {
    await expect(EncryptionService.decryptPayload("@@@NotBase64!!!")).rejects.toThrow(
      EncryptionError,
    );
  });

  it("throws EncryptionError for payload shorter than 13 bytes", async () => {
    const shortBase64 = btoa("12345");
    await expect(EncryptionService.decryptPayload(shortBase64)).rejects.toThrow(EncryptionError);
  });
});
