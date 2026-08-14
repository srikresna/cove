import * as Y from "yjs";
import { base64ToBytes, bytesToBase64 } from "../vault/crypto";

export function encodeDocSnapshot(doc: Y.Doc): string {
  return bytesToBase64(new Uint8Array(Y.encodeStateAsUpdate(doc)));
}

export function applySnapshot(doc: Y.Doc, snapshotB64: string): void {
  Y.applyUpdate(doc, base64ToBytes(snapshotB64));
}

export function docFromSnapshot(snapshotB64: string): Y.Doc {
  const doc = new Y.Doc();
  applySnapshot(doc, snapshotB64);
  return doc;
}

export function tryDocFromSnapshot(snapshotB64: string): Y.Doc | null {
  try {
    return docFromSnapshot(snapshotB64);
  } catch {
    return null;
  }
}
