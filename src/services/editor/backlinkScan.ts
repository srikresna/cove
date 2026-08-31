import * as Y from "yjs";
import { unpackBlockSuiteContent } from "./contentFormat";
import { tryDocFromSnapshot } from "./yjsCodec";

interface ReferenceDelta {
  attributes?: { reference?: { type?: string; pageId?: string } };
}

export interface DatabaseRowRef {
  refDocId: string;
  databaseId: string;
  databaseRowId: string;
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

/** Pure scan of one note's content for database rows referencing other docs.
 *  Caching, dedupe, and invalidation live in the query layer
 *  (["backlink-scan", noteId]). */
export async function scanNoteRows(
  getNoteContent: (noteId: string) => Promise<string | undefined>,
  noteId: string,
): Promise<DatabaseRowRef[]> {
  try {
    const content = await getNoteContent(noteId);
    const snapshot = content ? unpackBlockSuiteContent(content) : null;
    if (!snapshot) return [];
    const doc = tryDocFromSnapshot(snapshot);
    return doc ? scanDocForDatabaseRows(doc) : [];
  } catch {
    return [];
  }
}
