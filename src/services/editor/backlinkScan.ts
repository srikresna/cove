import * as Y from "yjs";
import type { DatabaseBacklinkRef } from "../blocksuite/IBlockSuiteEditorService";
import { unpackBlockSuiteContent } from "./contentFormat";
import { tryDocFromSnapshot } from "./yjsCodec";

interface ReferenceDelta {
  attributes?: { reference?: { type?: string; pageId?: string } };
}

interface DatabaseRowRef {
  refDocId: string;
  databaseId: string;
  databaseRowId: string;
}

const rowsBySourceNoteId = new Map<string, DatabaseRowRef[]>();

export function invalidateNoteBacklinkScan(noteId: string): void {
  rowsBySourceNoteId.delete(noteId);
}

export function scannedBacklinksOf(targetDocId: string): DatabaseBacklinkRef[] {
  const refs: DatabaseBacklinkRef[] = [];
  for (const [sourceNoteId, rows] of rowsBySourceNoteId) {
    for (const row of rows) {
      if (row.refDocId !== targetDocId) continue;
      refs.push({
        databaseDocId: sourceNoteId,
        databaseId: row.databaseId,
        databaseRowId: row.databaseRowId,
      });
    }
  }
  return refs;
}

function scanDocForDatabaseRows(doc: Y.Doc): DatabaseRowRef[] {
  const blocks = doc.getMap("blocks");
  const rows: DatabaseRowRef[] = [];

  const linkedPageIdOf = (block: Y.Map<unknown>): string | null => {
    const text = block.get("prop:title") ?? block.get("prop:text");
    if (!(text instanceof Y.Text)) return null;
    for (const op of text.toDelta() as ReferenceDelta[]) {
      const ref = op.attributes?.reference;
      if (ref?.type === "LinkedPage" && typeof ref.pageId === "string") {
        return ref.pageId;
      }
    }
    return null;
  };

  for (const block of blocks.values()) {
    if (!(block instanceof Y.Map)) continue;
    if (block.get("sys:flavour") !== "affine:database") continue;
    const databaseId = block.get("sys:id");
    const children = block.get("sys:children");
    if (typeof databaseId !== "string" || !(children instanceof Y.Array)) continue;
    for (const childId of children.toArray()) {
      if (typeof childId !== "string") continue;
      const child = blocks.get(childId);
      if (!(child instanceof Y.Map)) continue;
      const refDocId = linkedPageIdOf(child);
      if (!refDocId) continue;
      rows.push({ refDocId, databaseId, databaseRowId: childId });
    }
  }
  return rows;
}

export async function scanNoteForDatabaseRows(
  getNoteContent: (noteId: string) => Promise<string | undefined>,
  noteId: string,
): Promise<void> {
  try {
    const content = await getNoteContent(noteId);
    const snapshot = content ? unpackBlockSuiteContent(content) : null;
    if (!snapshot) {
      rowsBySourceNoteId.set(noteId, []);
      return;
    }
    const doc = tryDocFromSnapshot(snapshot);
    rowsBySourceNoteId.set(noteId, doc ? scanDocForDatabaseRows(doc) : []);
  } catch {
    rowsBySourceNoteId.set(noteId, []);
  }
}
