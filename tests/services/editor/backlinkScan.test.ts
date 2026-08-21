import { beforeEach, describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  clearBacklinkScans,
  ensureNoteScanned,
  hasBacklinkScan,
  invalidateNoteBacklinkScan,
  scanNoteForDatabaseRows,
  scannedBacklinksOf,
} from "@/services/editor/backlinkScan";
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
  return async (noteId: string) => contents.get(noteId);
}

describe("backlinkScan", () => {
  beforeEach(() => {
    clearBacklinkScans();
  });

  it("records database rows whose title references a linked page", async () => {
    const contents = new Map([["note-db", databaseContentWithLinkedRow()]]);
    expect(hasBacklinkScan("note-db")).toBe(false);

    await scanNoteForDatabaseRows(contentGetter(contents), "note-db");

    expect(hasBacklinkScan("note-db")).toBe(true);
    expect(scannedBacklinksOf("target-1")).toEqual([
      { databaseDocId: "note-db", databaseId: "db", databaseRowId: "row-1" },
    ]);
    expect(scannedBacklinksOf("unrelated-target")).toEqual([]);
  });

  it("records an empty scan for missing or non-BlockSuite content", async () => {
    const contents = new Map([["note-plain", "just markdown text"]]);
    await scanNoteForDatabaseRows(contentGetter(contents), "note-plain");
    expect(hasBacklinkScan("note-plain")).toBe(true);
    expect(scannedBacklinksOf("target-1")).toEqual([]);

    await scanNoteForDatabaseRows(contentGetter(contents), "note-missing");
    expect(hasBacklinkScan("note-missing")).toBe(true);
    expect(scannedBacklinksOf("target-1")).toEqual([]);
  });

  it("a corrupt snapshot yields no refs without throwing", async () => {
    const contents = new Map([["note-corrupt", packBlockSuiteContent("%%%not-base64%%%")]]);

    await expect(
      scanNoteForDatabaseRows(contentGetter(contents), "note-corrupt"),
    ).resolves.toBeUndefined();
    expect(hasBacklinkScan("note-corrupt")).toBe(true);
    expect(scannedBacklinksOf("target-1")).toEqual([]);
  });

  it("invalidateNoteBacklinkScan drops one scan and clearBacklinkScans drops all", async () => {
    const contents = new Map([["note-db", databaseContentWithLinkedRow()]]);
    await scanNoteForDatabaseRows(contentGetter(contents), "note-db");
    expect(scannedBacklinksOf("target-1")).toHaveLength(1);

    invalidateNoteBacklinkScan("note-db");
    expect(hasBacklinkScan("note-db")).toBe(false);
    expect(scannedBacklinksOf("target-1")).toEqual([]);

    await scanNoteForDatabaseRows(contentGetter(contents), "note-db");
    expect(scannedBacklinksOf("target-1")).toHaveLength(1);

    clearBacklinkScans();
    expect(hasBacklinkScan("note-db")).toBe(false);
    expect(scannedBacklinksOf("target-1")).toEqual([]);
  });

  it("ensureNoteScanned shares one in-flight pass across concurrent callers", async () => {
    const contents = new Map([["note-db", databaseContentWithLinkedRow()]]);
    let fetches = 0;
    const slowGetter = async (noteId: string) => {
      fetches += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return contents.get(noteId);
    };

    // Several Info panels mounting at once race their scan loops; without the
    // in-flight gate each would fetch and decrypt the same note.
    await Promise.all([
      ensureNoteScanned(slowGetter, "note-db"),
      ensureNoteScanned(slowGetter, "note-db"),
      ensureNoteScanned(slowGetter, "note-db"),
    ]);

    expect(fetches).toBe(1);
    expect(hasBacklinkScan("note-db")).toBe(true);
    expect(scannedBacklinksOf("target-1")).toHaveLength(1);

    // Once cached, later callers resolve without another fetch.
    await ensureNoteScanned(slowGetter, "note-db");
    expect(fetches).toBe(1);
  });
});
