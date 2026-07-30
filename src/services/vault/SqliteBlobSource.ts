import type { BlobSource } from "@blocksuite/sync";
import type { IBlobRepository } from "../../repositories/IBlobRepository";
import type { IEncryptionService } from "./IEncryptionService";
import { blobAad } from "./aad";
import type { Bytes } from "./crypto";

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
 * Holds no plaintext cache, so a vault lock leaves nothing to scrub — blobs are
 * re-decrypted from the (encrypted) DB on the next open.
 */
export class SqliteBlobSource implements BlobSource {
  readonly name = "cove-sqlite";
  readonly readonly = false;

  constructor(
    private readonly blobs: IBlobRepository,
    private readonly crypto: IEncryptionService,
  ) {}

  async get(key: string): Promise<Blob | null> {
    const rec = await this.blobs.get(key);
    if (!rec) return null;
    const { mime, bytes } = splitBlobContainer(
      await this.crypto.decryptBlob(rec.payload, blobAad(key)),
    );
    return new Blob([bytes.slice()], { type: mime });
  }

  async set(key: string, value: Blob): Promise<string> {
    const buf = new Uint8Array(await value.arrayBuffer());
    const payload = await this.crypto.encryptBlob(
      makeBlobContainer(value.type ?? "", buf),
      blobAad(key),
    );
    await this.blobs.upsert({ id: key, payload, kmsVersion: KMS_VERSION_DEK });
    return key;
  }

  async delete(key: string): Promise<void> {
    await this.blobs.delete(key);
  }

  async list(): Promise<string[]> {
    return this.blobs.listIds();
  }
}
