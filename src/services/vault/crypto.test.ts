import { describe, expect, it } from "vitest";
import {
  aesGcmDecrypt,
  aesGcmEncrypt,
  base64ToBytes,
  bytesToBase64,
  computeIntegrityMac,
  computeIntegrityMacDelimited,
  constantTimeEqual,
  counterToIv,
  derivePrk,
  deriveSubkey,
  encodeUtf8,
  generateDek,
  generateSalt,
  importAesGcmKey,
  importHmacKey,
  unwrapDek,
  wrapDek,
} from "./crypto";

describe("vault/crypto base64", () => {
  it("round-trips bytes through base64", () => {
    const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });
});

describe("vault/crypto PBKDF2 + HKDF", () => {
  it("derivePrk is deterministic for the same passphrase/salt/iterations", async () => {
    const salt = generateSalt();
    const a = await derivePrk("correct horse battery", salt, 1000);
    const b = await derivePrk("correct horse battery", salt, 1000);
    expect(a).toEqual(b);
  });

  it("derivePrk differs across salts and passphrases", async () => {
    const s1 = generateSalt();
    const s2 = generateSalt();
    const a = await derivePrk("pw", s1, 1000);
    const b = await derivePrk("pw", s2, 1000);
    const c = await derivePrk("other", s1, 1000);
    expect(constantTimeEqual(a, b)).toBe(false);
    expect(constantTimeEqual(a, c)).toBe(false);
  });

  it("deriveSubkey provides HKDF domain separation", async () => {
    const prk = await derivePrk("pw", generateSalt(), 1000);
    const wrap = await deriveSubkey(prk, "dek-wrap");
    const mac = await deriveSubkey(prk, "integrity-mac");
    const wrapAgain = await deriveSubkey(prk, "dek-wrap");
    expect(constantTimeEqual(wrap, mac)).toBe(false);
    expect(constantTimeEqual(wrap, wrapAgain)).toBe(true);
  });
});

describe("vault/crypto DEK", () => {
  it("generateDek produces a 32-byte non-extractable AES-GCM key", async () => {
    const { rawKey, cryptoKey } = await generateDek();
    expect(rawKey.byteLength).toBe(32);
    expect(cryptoKey.extractable).toBe(false);
    expect(cryptoKey.usages).toContain("encrypt");
    expect(cryptoKey.usages).toContain("decrypt");
  });

  it("generateDek is random — two DEKs differ", async () => {
    const a = await generateDek();
    const b = await generateDek();
    expect(constantTimeEqual(a.rawKey, b.rawKey)).toBe(false);
  });

  it("wrap/unwrap round-trips the DEK under the wrap key", async () => {
    const prk = await derivePrk("pw", generateSalt(), 1000);
    const wrapRaw = await deriveSubkey(prk, "dek-wrap");
    const wrapKey = await importAesGcmKey(wrapRaw);
    const dek = await generateDek();

    const wrapped = await wrapDek(wrapKey, dek.rawKey);
    const unwrapped = await unwrapDek(wrapKey, wrapped);
    expect(unwrapped).toEqual(dek.rawKey);
  });

  it("unwrap with a wrong wrap key throws (GCM auth-tag failure)", async () => {
    const prk = await derivePrk("pw", generateSalt(), 1000);
    const wrapKey = await importAesGcmKey(await deriveSubkey(prk, "dek-wrap"));
    const dek = await generateDek();
    const wrapped = await wrapDek(wrapKey, dek.rawKey);

    const wrongWrap = await importAesGcmKey(await deriveSubkey(prk, "other-label"));
    await expect(unwrapDek(wrongWrap, wrapped)).rejects.toThrow();
  });
});

describe("vault/crypto integrity MAC", () => {
  it("is deterministic for the same fields and key", async () => {
    const macKey = await importHmacKey(
      await deriveSubkey(await derivePrk("pw", generateSalt(), 1000), "integrity-mac"),
    );
    const fields = [new Uint8Array([1, 2, 3]), new Uint8Array([4, 5])];
    expect(await computeIntegrityMac(macKey, fields)).toEqual(
      await computeIntegrityMac(macKey, fields),
    );
  });

  it("changes when any field changes (detects tamper/splice)", async () => {
    const macKey = await importHmacKey(
      await deriveSubkey(await derivePrk("pw", generateSalt(), 1000), "integrity-mac"),
    );
    const a = await computeIntegrityMac(macKey, [new Uint8Array([1, 2, 3])]);
    const b = await computeIntegrityMac(macKey, [new Uint8Array([1, 2, 4])]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });

  it("delimited MAC distinguishes field boundaries (no reparse ambiguity)", async () => {
    const macKey = await importHmacKey(
      await deriveSubkey(await derivePrk("pw", generateSalt(), 1000), "integrity-mac"),
    );
    const split1 = [encodeUtf8("ab"), encodeUtf8("c")];
    const split2 = [encodeUtf8("a"), encodeUtf8("bc")];
    expect(
      constantTimeEqual(
        await computeIntegrityMac(macKey, split1),
        await computeIntegrityMac(macKey, split2),
      ),
    ).toBe(true);
    expect(
      constantTimeEqual(
        await computeIntegrityMacDelimited(macKey, split1),
        await computeIntegrityMacDelimited(macKey, split2),
      ),
    ).toBe(false);
    expect(await computeIntegrityMacDelimited(macKey, split1)).toEqual(
      await computeIntegrityMacDelimited(macKey, split1),
    );
  });
});

describe("vault/crypto constantTimeEqual", () => {
  it("returns true for equal byte arrays and false otherwise", () => {
    expect(constantTimeEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
    expect(constantTimeEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false);
    expect(constantTimeEqual(new Uint8Array([1, 2]), new Uint8Array([1, 2, 3]))).toBe(false);
  });
});

describe("vault/crypto AES-GCM payload + counter IV", () => {
  it("counterToIv is deterministic and unique per counter", () => {
    const a = counterToIv(1);
    const b = counterToIv(1);
    const c = counterToIv(2);
    expect(a).toEqual(b);
    expect(constantTimeEqual(a, c)).toBe(false);
    expect(a.byteLength).toBe(12);
  });

  it("aesGcm encrypt/decrypt round-trips UTF-8 text", async () => {
    const key = await importAesGcmKey(await generateDek().then((d) => d.rawKey));
    const iv = counterToIv(42);
    const ct = await aesGcmEncrypt(key, "Hello 🚀 notes", iv);
    expect(ct).not.toBe("Hello 🚀 notes");
    expect(await aesGcmDecrypt(key, ct)).toBe("Hello 🚀 notes");
  });

  it("aesGcm decrypt with the wrong key throws (auth-tag failure)", async () => {
    const k1 = await importAesGcmKey(await generateDek().then((d) => d.rawKey));
    const k2 = await importAesGcmKey(await generateDek().then((d) => d.rawKey));
    const ct = await aesGcmEncrypt(k1, "secret", counterToIv(1));
    await expect(aesGcmDecrypt(k2, ct)).rejects.toThrow();
  });

  it("binds ciphertext to AAD (note id): same AAD round-trips, wrong AAD fails", async () => {
    const key = await importAesGcmKey((await generateDek()).rawKey);
    const iv = counterToIv(7);
    const ct = await aesGcmEncrypt(key, "secret body", iv, encodeUtf8("note-A"));
    expect(await aesGcmDecrypt(key, ct, encodeUtf8("note-A"))).toBe("secret body");
    await expect(aesGcmDecrypt(key, ct, encodeUtf8("note-B"))).rejects.toThrow();
  });
});
