const PBKDF2_HASH = "SHA-256";
const HKDF_HASH = "SHA-256";
const KEY_BITS = 256;
export const KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
export const SALT_BYTES = 16;

// OWASP 2026 floor for PBKDF2-HMAC-SHA256 (legacy vaults only; new vaults use Argon2id).
export const PBKDF2_ITERATIONS = 600_000;

// Per-DEK AES-GCM encryption ceiling, well below the 2^32 NIST SP 800-38D
// birthday bound; hitting it fails loud so the key rotates before IV-reuse risk.
export const IV_EXHAUSTION_LIMIT = 2 ** 28;

export type Bytes = Uint8Array<ArrayBuffer>;

export function randomBytes(n: number): Bytes {
  return crypto.getRandomValues(new Uint8Array(n));
}

// Best-effort scrubbing: GC may already have copied the bytes — defense-in-depth only.
export function zeroize(bytes: Bytes): void {
  bytes.fill(0);
}

export function generateSalt(): Bytes {
  return randomBytes(SALT_BYTES);
}

export function encodeUtf8(s: string): Bytes {
  return new Uint8Array(new TextEncoder().encode(s));
}

export function bytesToBase64(bytes: Bytes): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(sub));
  }
  return btoa(binary);
}

export function base64ToBytes(b64: string): Bytes {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export async function derivePrk(
  passphrase: string,
  salt: Bytes,
  iterations: number,
): Promise<Bytes> {
  const baseKey = await crypto.subtle.importKey("raw", encodeUtf8(passphrase), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: PBKDF2_HASH },
    baseKey,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

// Empty HKDF salt: the PRK is already salted by the passphrase KDF.
export async function deriveSubkey(
  prk: Bytes,
  info: string,
  lengthBytes = KEY_BYTES,
): Promise<Bytes> {
  const ikm = await crypto.subtle.importKey("raw", prk, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: HKDF_HASH, salt: new Uint8Array(0), info: encodeUtf8(info) },
    ikm,
    lengthBytes * 8,
  );
  return new Uint8Array(bits);
}

export async function importAesGcmKey(raw: Bytes): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: KEY_BITS }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function importHmacKey(raw: Bytes): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function generateDek(): Promise<{ rawKey: Bytes; cryptoKey: CryptoKey }> {
  const rawKey = randomBytes(KEY_BYTES);
  const cryptoKey = await importAesGcmKey(rawKey);
  return { rawKey, cryptoKey };
}

export async function wrapDek(wrapKey: CryptoKey, rawDek: Bytes): Promise<Bytes> {
  const iv = randomBytes(GCM_IV_BYTES);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, rawDek));
  const out = new Uint8Array(GCM_IV_BYTES + ct.byteLength);
  out.set(iv, 0);
  out.set(ct, GCM_IV_BYTES);
  return out;
}

export async function unwrapDek(wrapKey: CryptoKey, wrapped: Bytes): Promise<Bytes> {
  if (wrapped.byteLength < GCM_IV_BYTES + GCM_TAG_BYTES) {
    throw new Error("wrapped DEK is too short");
  }
  const iv = wrapped.subarray(0, GCM_IV_BYTES);
  const ct = wrapped.subarray(GCM_IV_BYTES);
  const pt = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, wrapKey, ct));
  return pt;
}

// Legacy envelope v1/v2 verification only: plain concatenation leaves field
// boundaries ambiguous — new envelopes use computeIntegrityMacDelimited.
export async function computeIntegrityMac(macKey: CryptoKey, fields: Bytes[]): Promise<Bytes> {
  const total = fields.reduce((n, f) => n + f.byteLength, 0);
  const buf = new Uint8Array(total);
  let off = 0;
  for (const f of fields) {
    buf.set(f, off);
    off += f.byteLength;
  }
  const sig = await crypto.subtle.sign("HMAC", macKey, buf);
  return new Uint8Array(sig);
}

// 4-byte big-endian length prefix per field: ["ab","c"] can never collide with ["a","bc"].
export async function computeIntegrityMacDelimited(
  macKey: CryptoKey,
  fields: Bytes[],
): Promise<Bytes> {
  const total = fields.reduce((n, f) => n + 4 + f.byteLength, 0);
  const buf = new Uint8Array(total);
  const view = new DataView(buf.buffer);
  let off = 0;
  for (const f of fields) {
    view.setUint32(off, f.byteLength);
    buf.set(f, off + 4);
    off += 4 + f.byteLength;
  }
  const sig = await crypto.subtle.sign("HMAC", macKey, buf);
  return new Uint8Array(sig);
}

export function constantTimeEqual(a: Bytes, b: Bytes): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

// Deterministic counter IV (NIST SP 800-38D §8.2.1). Uniqueness is enforced by
// CryptoVault's synchronous increment, persisted via kms.setIvCounter BEFORE use.
export function counterToIv(counter: number): Bytes {
  const iv = new Uint8Array(GCM_IV_BYTES);
  const view = new DataView(iv.buffer);
  view.setUint32(8, counter >>> 0);
  view.setUint32(4, Math.floor(counter / 0x100000000));
  return iv;
}

export async function aesGcmEncrypt(
  key: CryptoKey,
  plaintext: string,
  iv: Bytes,
  aad?: Bytes,
): Promise<string> {
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      aad ? { name: "AES-GCM", iv, additionalData: aad } : { name: "AES-GCM", iv },
      key,
      encodeUtf8(plaintext),
    ),
  );
  const out = new Uint8Array(GCM_IV_BYTES + ct.byteLength);
  out.set(iv, 0);
  out.set(ct, GCM_IV_BYTES);
  return bytesToBase64(out);
}

export async function aesGcmDecrypt(
  key: CryptoKey,
  payloadB64: string,
  aad?: Bytes,
): Promise<string> {
  const combined = base64ToBytes(payloadB64);
  if (combined.byteLength < GCM_IV_BYTES + GCM_TAG_BYTES) {
    throw new Error("payload too short");
  }
  const iv = combined.subarray(0, GCM_IV_BYTES);
  const ct = combined.subarray(GCM_IV_BYTES);
  const pt = await crypto.subtle.decrypt(
    aad ? { name: "AES-GCM", iv, additionalData: aad } : { name: "AES-GCM", iv },
    key,
    ct,
  );
  return new TextDecoder().decode(pt);
}
