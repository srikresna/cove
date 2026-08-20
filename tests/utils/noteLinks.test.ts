import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { packBlockSuiteContent } from "@/services/editor/contentFormat";
import { encodeDocSnapshot } from "@/services/editor/yjsCodec";
import { extractNoteLinkIds } from "@/utils/noteLinks";

function linkedContent(targetIds: string[]): string {
  const doc = new Y.Doc();
  const blocks = doc.getMap("blocks");
  const page = new Y.Map<unknown>();
  blocks.set("page", page);
  page.set("sys:id", "page");
  page.set("sys:flavour", "affine:page");
  page.set("sys:children", Y.Array.from(["p1"]));
  const block = new Y.Map<unknown>();
  blocks.set("p1", block);
  block.set("sys:id", "p1");
  block.set("sys:flavour", "affine:paragraph");
  block.set("sys:children", Y.Array.from([]));
  const text = new Y.Text();
  targetIds.forEach((id, i) => {
    if (i > 0) text.insert(text.length, " and ");
    text.insert(text.length, `link ${i}`, { reference: { type: "LinkedPage", pageId: id } });
  });
  block.set("prop:text", text);
  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

describe("extractNoteLinkIds", () => {
  it("returns [] for empty or non-BlockSuite content", () => {
    expect(extractNoteLinkIds("")).toEqual([]);
    expect(extractNoteLinkIds("plain text")).toEqual([]);
  });

  it("collects LinkedPage reference ids from paragraph text", () => {
    expect(extractNoteLinkIds(linkedContent(["note-2"]))).toEqual(["note-2"]);
  });

  it("collects multiple distinct references, deduplicated", () => {
    expect(extractNoteLinkIds(linkedContent(["a", "b", "a"]))).toEqual(["a", "b"]);
  });
});
