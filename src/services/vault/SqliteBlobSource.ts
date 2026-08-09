import type { BlobSource } from "@blocksuite/sync";
import type { IBlobRepository } from "../../repositories/IBlobRepository";
import { blobAad } from "./aad";
import type { Bytes } from "./crypto";
import type { IEncryptionService } from "./IEncryptionService";

const KMS_VERSION_DEK = 1;

// One ciphertext container holding MIME + bytes, so the image block (which
// branches on blob.type) still renders after an encrypt/decrypt round-trip:
//   [mimeLen: uint32 BE][mimeUtf8: mimeLen bytes][blobBytes...]
function makeBlobContainer(mime: string, bytes: Bytes): Bytes {
  const mimeBytes = new TextEncoder().encode(mime);
  const out = new Uint8Array(4 + mimeBytes.byteLength + bytes.byteLength);
  const view = new DataView(out.buffer);
  view.setUint32(0, mimeBytes.byteLength);
  out.set(mimeBytes, 4);
  out.set(bytes, 4 + mimeBytes.byteLength);
  return out;
}

function splitBlobContainer(bytes: Bytes): { mime: string; bytes: Uint8Array } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const mimeLen = view.getUint32(0);
  const mime = new TextDecoder().decode(bytes.subarray(4, 4 + mimeLen));
  return { mime, bytes: bytes.subarray(4 + mimeLen) };
}

/**
 * A persistent, vault-encrypted BlobSource for BlockSuite. Stores image /
 * attachment bytes encrypted with the session DEK in the `note_blobs` table.
 *
 * BlockSuite's edgeless renderer re-fetches the same blobs on every frame
 * render/animation (hundreds of redundant queries per second during
 * presentation — confirmed via query diagnostic), exhausting the
 * tauri-plugin-sql pool and causing slow-acquire warnings. An in-memory cache
 * deduplicates these fetches. The cache is cleared on vault lock so no
 * plaintext survives a lockdown.
 */
export class SqliteBlobSource implements BlobSource {
  readonly name = "cove-sqlite";
  readonly readonly = false;

  // LRU-bounded cache: key → decrypted Blob (or null = known-missing). Cleared
  // on vault lock. Capped at MAX_CACHE entries to bound memory; oldest evicted.
  private static readonly MAX_CACHE = 200;
  private readonly cache = new Map<string, Blob | null>();

  constructor(
    private readonly blobs: IBlobRepository,
    private readonly crypto: IEncryptionService,
  ) {}

  /** Clear the plaintext cache — called on vault lock. */
  clearCache(): void {
    this.cache.clear();
  }

  /** Evict the oldest entry if the cache is at capacity (LRU). */
  private evictIfNeeded(): void {
    if (this.cache.size >= SqliteBlobSource.MAX_CACHE) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
  }

  async get(key: string): Promise<Blob | null> {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      // LRU: re-insert to move to end (most-recently-used).
      this.cache.delete(key);
      this.cache.set(key, cached ?? null);
      return cached ? cached.slice(0, cached.size, cached.type) : null;
    }
    const rec = await this.blobs.get(key);
    if (!rec) {
      this.evictIfNeeded();
      this.cache.set(key, null);
      return null;
    }
    const { mime, bytes } = splitBlobContainer(
      await this.crypto.decryptBlob(rec.payload, blobAad(key)),
    );
    const blob = new Blob([bytes.slice()], { type: mime });
    this.evictIfNeeded();
    this.cache.set(key, blob);
    return blob.slice(0, blob.size, blob.type);
  }

  async set(key: string, value: Blob): Promise<string> {
    const buf = new Uint8Array(await value.arrayBuffer());
    const payload = await this.crypto.encryptBlob(
      makeBlobContainer(value.type ?? "", buf),
      blobAad(key),
    );
    await this.blobs.upsert({ id: key, payload, kmsVersion: KMS_VERSION_DEK });
    this.cache.set(key, value.slice(0, value.size, value.type));
    return key;
  }

  async delete(key: string): Promise<void> {
    await this.blobs.delete(key);
    this.cache.delete(key);
  }

  async list(): Promise<string[]> {
    return this.blobs.listIds();
  }
}
