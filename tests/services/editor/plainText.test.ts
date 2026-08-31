import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { packBlockSuiteContent } from "@/services/editor/contentFormat";
import {
  buildSnippet,
  countWordsAndChars,
  extractParagraphs,
  extractPlainText,
} from "@/services/editor/plainText";
import { encodeDocSnapshot } from "@/services/editor/yjsCodec";

function paragraphContent(...texts: string[]): string {
  const doc = new Y.Doc();
  const blocks = doc.getMap("blocks");
  const ids = texts.map((_, i) => `p${i}`);
  const page = new Y.Map<unknown>();
  blocks.set("page", page);
  page.set("sys:id", "page");
  page.set("sys:flavour", "affine:page");
  page.set("sys:children", Y.Array.from(ids));
  texts.forEach((text, i) => {
    const block = new Y.Map<unknown>();
    blocks.set(ids[i] as string, block);
    block.set("sys:id", ids[i]);
    block.set("sys:flavour", "affine:paragraph");
    block.set("sys:children", Y.Array.from([]));
    const ytext = new Y.Text();
    ytext.insert(0, text);
    block.set("prop:text", ytext);
  });
  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

describe("extractParagraphs / extractPlainText", () => {
  it("returns an empty list for empty content", () => {
    expect(extractParagraphs("")).toEqual([]);
    expect(extractPlainText("")).toBe("");
  });

  it("returns an empty list for non-BlockSuite content", () => {
    expect(extractParagraphs("just plain markdown")).toEqual([]);
  });

  it("extracts paragraph text from packed BlockSuite content", () => {
    const content = paragraphContent("Hello world", "Second   paragraph");

    const paragraphs = extractParagraphs(content);
    expect(paragraphs[0]).toBe("Hello world");
    expect(paragraphs[1]).toBe("Second   paragraph");

    const plain = extractPlainText(content);
    expect(plain).toContain("Hello world");
    expect(plain).toContain("Second paragraph");
  });

  it("repeated calls return the same result (memoized path)", () => {
    const content = paragraphContent("stable text");
    expect(extractParagraphs(content)).toBe(extractParagraphs(content));
  });
});

describe("countWordsAndChars", () => {
  it("counts words and characters of packed content", () => {
    const { wordCount, characterCount } = countWordsAndChars(paragraphContent("one two three"));

    expect(wordCount).toBe(3);
    expect(characterCount).toBe(13);
  });

  it("empty content counts as zero", () => {
    expect(countWordsAndChars("")).toEqual({ wordCount: 0, characterCount: 0 });
  });
});

describe("buildSnippet", () => {
  it("returns short text trimmed as-is", () => {
    expect(buildSnippet("  hello world  ", "hello")).toBe("hello world");
  });

  it("centers the snippet around the query with ellipses", () => {
    const text = `${"a".repeat(100)}needle${"b".repeat(100)}`;
    const snippet = buildSnippet(text, "needle");

    expect(snippet.startsWith("…")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet).toContain("needle");
    expect(snippet.length).toBeLessThanOrEqual(82);
  });

  it("falls back to the start when the query is absent", () => {
    const text = `${"x".repeat(200)}`;
    const snippet = buildSnippet(text, "missing", 40);

    expect(snippet.startsWith("…")).toBe(false);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet.length).toBeLessThanOrEqual(42);
  });
});
