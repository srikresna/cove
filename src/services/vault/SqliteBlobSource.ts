import type { BlobSource } from "@blocksuite/sync";
import type { IBlobRepository } from "../../repositories/IBlobRepository";
import { blobAad } from "./aad";
import type { Bytes } from "./crypto";
import type { IEncryptionService } from "./IEncryptionService";

const KMS_VERSION_DEK = 1;

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

export class SqliteBlobSource implements BlobSource {
  readonly name = "cove-sqlite";
  readonly readonly = false;

  private static readonly MAX_CACHE = 200;
  private readonly cache = new Map<string, Blob | null>();
  private lockEpoch = 0;

  constructor(
    private readonly blobs: IBlobRepository,
    private readonly crypto: IEncryptionService,
  ) {}

  clearCache(): void {
    this.cache.clear();
    this.lockEpoch += 1;
  }

  private evictIfNeeded(): void {
    if (this.cache.size >= SqliteBlobSource.MAX_CACHE) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
  }

  async get(key: string): Promise<Blob | null> {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);

      this.cache.delete(key);
      this.cache.set(key, cached ?? null);
      return cached ? cached.slice(0, cached.size, cached.type) : null;
    }
    const epoch = this.lockEpoch;
    const rec = await this.blobs.get(key);
    if (!rec) {
      if (epoch === this.lockEpoch) {
        this.evictIfNeeded();
        this.cache.set(key, null);
      }
      return null;
    }
    try {
      const { mime, bytes } = splitBlobContainer(
        await this.crypto.decryptBlob(rec.payload, blobAad(key)),
      );
      const blob = new Blob([bytes.slice()], { type: mime });
      if (epoch === this.lockEpoch) {
        this.evictIfNeeded();
        this.cache.set(key, blob);
      }
      return blob.slice(0, blob.size, blob.type);
    } catch {
      if (epoch === this.lockEpoch) {
        this.evictIfNeeded();
        this.cache.set(key, null);
      }
      return null;
    }
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
