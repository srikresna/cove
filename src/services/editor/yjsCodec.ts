import * as Y from "yjs";
import { base64ToBytes, bytesToBase64 } from "../vault/crypto";

/** Full-state snapshot of a doc as a base64 string, ready for encryptPayload. */
export function encodeDocSnapshot(doc: Y.Doc): string {
  // Copy pins the bytes to a plain ArrayBuffer, matching the crypto Bytes type.
  return bytesToBase64(new Uint8Array(Y.encodeStateAsUpdate(doc)));
}

/** Applies a base64 snapshot (or incremental update) onto an existing doc. */
export function applySnapshot(doc: Y.Doc, snapshotB64: string): void {
  Y.applyUpdate(doc, base64ToBytes(snapshotB64));
}

/** Rebuilds a fresh doc from a base64 snapshot. */
export function docFromSnapshot(snapshotB64: string): Y.Doc {
  const doc = new Y.Doc();
  applySnapshot(doc, snapshotB64);
  return doc;
}

/**
 * Rebuilds a fresh doc from a base64 snapshot, or null if the snapshot is
 * missing, truncated, or otherwise undecodable. Centralizing the decode-failure
 * path here means one corrupt note degrades gracefully (empty extraction)
 * instead of throwing and aborting search/save for every note.
 */
export function tryDocFromSnapshot(snapshotB64: string): Y.Doc | null {
  try {
    return docFromSnapshot(snapshotB64);
  } catch {
    return null;
  }
}
