import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  extractBlockSuiteHeadings,
  extractBlockSuiteLinkIds,
  extractBlockSuitePlainText,
} from "@/services/editor/blockSuiteContent";
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

function setText(block: Y.Map<unknown>, key: string, value: string): Y.Text {
  const text = new Y.Text();
  block.set(key, text);
  text.insert(0, value);
  return text;
}

function buildSampleContent(): string {
  const doc = new Y.Doc();
  const blocks = doc.getMap("blocks");

  const page = makeBlock(blocks, "page", "affine:page", ["note"]);
  setText(page, "prop:title", "Judul Catatan");
  makeBlock(blocks, "note", "affine:note", ["p1", "p2"]);
  const p1 = makeBlock(blocks, "p1", "affine:paragraph", []);
  setText(p1, "prop:text", "baris pertama");
  const p2 = makeBlock(blocks, "p2", "affine:paragraph", []);
  const t2 = setText(p2, "prop:text", "lihat ");
  t2.insert(t2.length, "target", {
    reference: { type: "LinkedPage", pageId: "note-target-1" },
  });

  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

describe("blockSuiteContent", () => {
  it("extracts plaintext in document order from an envelope", () => {
    expect(extractBlockSuitePlainText(buildSampleContent())).toBe(
      "Judul Catatan baris pertama lihat target",
    );
  });

  it("extracts referenced doc ids from text deltas", () => {
    expect(extractBlockSuiteLinkIds(buildSampleContent())).toEqual(["note-target-1"]);
  });

  it("extracts headings with levels in document order", () => {
    const doc = new Y.Doc();
    const blocks = doc.getMap("blocks");
    const page = makeBlock(blocks, "page", "affine:page", ["note"]);
    setText(page, "prop:title", "");
    makeBlock(blocks, "note", "affine:note", ["h", "p", "h3"]);
    const h = makeBlock(blocks, "h", "affine:paragraph", []);
    h.set("prop:type", "h1");
    setText(h, "prop:text", "Bab Satu");
    const p = makeBlock(blocks, "p", "affine:paragraph", []);
    p.set("prop:type", "text");
    setText(p, "prop:text", "isi");
    const h3 = makeBlock(blocks, "h3", "affine:paragraph", []);
    h3.set("prop:type", "h3");
    setText(h3, "prop:text", "Sub");

    const content = packBlockSuiteContent(encodeDocSnapshot(doc));
    expect(extractBlockSuiteHeadings(content)).toEqual([
      { id: "h", text: "Bab Satu", level: 1 },
      { id: "h3", text: "Sub", level: 3 },
    ]);
  });

  it("returns null for non-BlockSuite content", () => {
    expect(extractBlockSuitePlainText('[{"type":"paragraph"}]')).toBeNull();
    expect(extractBlockSuiteLinkIds("")).toBeNull();
  });
});
