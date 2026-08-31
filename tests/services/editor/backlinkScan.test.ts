import { describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import { scanNoteRows } from "@/services/editor/backlinkScan";
import { packBlockSuiteContent } from "@/services/editor/contentFormat";
import { encodeDocSnapshot } from "@/services/editor/yjsCodec";

function makeBlock(
  blocks: Y.Map<unknown>,
  id: string,
  flavour: string,
  children: string[],
): Y.Map<unknown> {
  const block = new Y.Map<unknown>();
  blocks.set(id, block);
  block.set("sys:id", id);
  block.set("sys:flavour", flavour);
  block.set("sys:children", Y.Array.from(children));
  return block;
}

function databaseContentWithLinkedRow(): string {
  const doc = new Y.Doc();
  const blocks = doc.getMap("blocks");

  makeBlock(blocks, "page", "affine:page", ["db"]);
  makeBlock(blocks, "db", "affine:database", ["row-1"]);
  const row = makeBlock(blocks, "row-1", "affine:database-row", []);
  const title = new Y.Text();
  row.set("prop:title", title);
  title.insert(0, "linked to ");
  title.insert(title.length, "target page", {
    reference: { type: "LinkedPage", pageId: "target-1" },
  });

  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

function contentGetter(
  contents: Map<string, string>,
): (noteId: string) => Promise<string | undefined> {
  return async (noteId) => contents.get(noteId);
}

describe("scanNoteRows", () => {
  it("finds database rows whose title references a linked page", async () => {
    const contents = new Map([["note-db", databaseContentWithLinkedRow()]]);

    const rows = await scanNoteRows(contentGetter(contents), "note-db");

    expect(rows).toEqual([{ refDocId: "target-1", databaseId: "db", databaseRowId: "row-1" }]);
  });

  it("returns no rows for missing or non-BlockSuite content", async () => {
    const contents = new Map([["note-plain", "just markdown text"]]);
    expect(await scanNoteRows(contentGetter(contents), "note-plain")).toEqual([]);
    expect(await scanNoteRows(contentGetter(contents), "note-missing")).toEqual([]);
  });

  it("a corrupt snapshot yields no rows without throwing", async () => {
    const contents = new Map([["note-corrupt", packBlockSuiteContent("%%%not-base64%%%")]]);
    await expect(scanNoteRows(contentGetter(contents), "note-corrupt")).resolves.toEqual([]);
  });

  it("a throwing content getter yields no rows", async () => {
    const getter = vi.fn().mockRejectedValue(new Error("decrypt failed"));
    await expect(scanNoteRows(getter, "n")).resolves.toEqual([]);
  });
});
