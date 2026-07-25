/**
 * Pure WebCrypto primitives for the passphrase-based vault.
 *
 * Stateless, no I/O — fully unit-testable in isolation. The stateful DEK/KEK
 * session and persistence live in the vault service / repositories.
 *
 * Key model (see docs/CRYPTO_VAULT_BLUEPRINT.md §0):
 * - PBKDF2-HMAC-SHA256(passphrase, salt, 600_000) -> 32-byte PRK
 * - HKDF(PRK, "dek-wrap")      -> wrap key (AES-GCM)  that encrypts the DEK
 * - HKDF(PRK, "integrity-mac") -> MAC key (HMAC-SHA256) for the kms envelope
 * Domain separation via distinct HKDF `info` labels prevents reusing the wrap
 * key as the MAC key. The DEK itself is a random 256-bit AES-GCM key that
 * encrypts note content; it never touches disk in the clear.
 */

const PBKDF2_HASH = "SHA-256";
const HKDF_HASH = "SHA-256";
const KEY_BITS = 256;
export const KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const GCM_TAG_BYTES = 16;
export const SALT_BYTES = 16;

/** OWASP 2026 floor for PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 600_000;

export type Bytes = Uint8Array<ArrayBuffer>;

export function randomBytes(n: number): Bytes {
  return crypto.getRandomValues(new Uint8Array(n));
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

/** PBKDF2 -> 32-byte pseudo-random key (PRK) from the passphrase. */
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

/** HKDF domain-separated subkey (empty salt — PRK is already salted via PBKDF2). */
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

/** AES-GCM-256 key (used both as the DEK and as the passphrase-derived wrap key). */
export async function importAesGcmKey(raw: Bytes): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM", length: KEY_BITS }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/** HMAC-SHA256 key for the kms integrity envelope. */
export async function importHmacKey(raw: Bytes): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/** Generate a fresh random DEK: raw bytes (for wrapping) + non-extractable CryptoKey (for use). */
export async function generateDek(): Promise<{ rawKey: Bytes; cryptoKey: CryptoKey }> {
  const rawKey = randomBytes(KEY_BYTES);
  const cryptoKey = await importAesGcmKey(rawKey);
  return { rawKey, cryptoKey };
}

/** AES-GCM wrap of the raw DEK under the wrap key. Output layout: iv(12) || ciphertext. */
export async function wrapDek(wrapKey: CryptoKey, rawDek: Bytes): Promise<Bytes> {
  const iv = randomBytes(GCM_IV_BYTES);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, wrapKey, rawDek));
  const out = new Uint8Array(GCM_IV_BYTES + ct.byteLength);
  out.set(iv, 0);
  out.set(ct, GCM_IV_BYTES);
  return out;
}

/** AES-GCM unwrap. Throws (GCM auth-tag failure) if the wrap key is wrong. */
export async function unwrapDek(wrapKey: CryptoKey, wrapped: Bytes): Promise<Bytes> {
  if (wrapped.byteLength < GCM_IV_BYTES + GCM_TAG_BYTES) {
    throw new Error("wrapped DEK is too short");
  }
  const iv = wrapped.subarray(0, GCM_IV_BYTES);
  const ct = wrapped.subarray(GCM_IV_BYTES);
  const pt = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, wrapKey, ct));
  return pt;
}

/** HMAC-SHA256 over the concatenation of field bytes — binds kms parameters. */
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

/** Constant-time byte comparison (avoids timing side-channels on MAC/verifier checks). */
export function constantTimeEqual(a: Bytes, b: Bytes): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}
