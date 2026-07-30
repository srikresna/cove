import { applySnapshot, docFromSnapshot, encodeDocSnapshot } from "@/services/editor/yjsCodec";
import type { EncryptedPayload, IEncryptionService } from "@/services/vault/IEncryptionService";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";

const envelopeCrypto: IEncryptionService = {
  isUnlocked: () => true,
  setSessionKeys: async () => {},
  clearSessionKeys: () => {},
  getIvCounter: () => 0,
  encryptBlob: async () => "" as EncryptedPayload,
  decryptBlob: async () => new Uint8Array(0),
  encryptPayload: async (p: string, aad: string) => `enc[${aad}]:${p}` as EncryptedPayload,
  decryptPayload: async (c: string, aad: string) => {
    const prefix = `enc[${aad}]:`;
    if (!c.startsWith(prefix)) throw new Error("payload was not encrypted for this note");
    return c.slice(prefix.length);
  },
};

describe("yjsCodec", () => {
  it("round-trips a doc snapshot through base64", () => {
    const doc = new Y.Doc();
    doc.getText("t").insert(0, "hello blocksuite");

    const restored = docFromSnapshot(encodeDocSnapshot(doc));
    expect(restored.getText("t").toString()).toBe("hello blocksuite");
  });

  it("round-trips through the EncryptedPayload contract (vault unchanged)", async () => {
    const doc = new Y.Doc();
    doc.getText("t").insert(0, "secret note body");

    const payload = await envelopeCrypto.encryptPayload(encodeDocSnapshot(doc), "note-1");
    const restored = docFromSnapshot(await envelopeCrypto.decryptPayload(payload, "note-1"));
    expect(restored.getText("t").toString()).toBe("secret note body");
  });

  it("applies incremental updates onto an existing doc (CRDT merge)", () => {
    const doc = new Y.Doc();
    doc.getText("t").insert(0, "abc");
    const snapshot = encodeDocSnapshot(doc);

    doc.getText("t").insert(3, "def");
    const later = encodeDocSnapshot(doc);

    const restored = docFromSnapshot(snapshot);
    applySnapshot(restored, later);
    expect(restored.getText("t").toString()).toBe("abcdef");
  });

  it("keeps snapshots deterministic for identical content and client", () => {
    const doc = new Y.Doc();
    doc.getText("t").insert(0, "same");
    expect(encodeDocSnapshot(doc)).toBe(encodeDocSnapshot(doc));
  });
});
