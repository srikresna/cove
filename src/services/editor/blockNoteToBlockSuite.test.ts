import { describe, expect, it } from "vitest";
import { convertBlockNoteContent } from "./blockNoteToBlockSuite";
import { packBlockSuiteContent } from "./contentFormat";

describe("blockNoteToBlockSuite", () => {
  it("converts paragraphs, headings, and styled inline text", () => {
    const content = JSON.stringify([
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Bagian", styles: {} }],
        children: [],
      },
      {
        type: "paragraph",
        props: {},
        content: [
          { type: "text", text: "tebal", styles: { bold: true } },
          {
            type: "link",
            href: "https://cove.app",
            content: [{ type: "text", text: "situs", styles: {} }],
          },
        ],
        children: [],
      },
    ]);

    const converted = convertBlockNoteContent(content);
    expect(converted).toEqual([
      {
        flavour: "affine:paragraph",
        props: { type: "h2" },
        deltas: [{ insert: "Bagian" }],
        children: [],
      },
      {
        flavour: "affine:paragraph",
        props: { type: "text" },
        deltas: [
          { insert: "tebal", attributes: { bold: true } },
          { insert: "situs", attributes: { link: "https://cove.app" } },
        ],
        children: [],
      },
    ]);
  });

  it("converts nested checklists and note links to references", () => {
    const content = JSON.stringify([
      {
        type: "checkListItem",
        props: { checked: true },
        content: [{ type: "text", text: "induk", styles: {} }],
        children: [
          {
            type: "bulletListItem",
            props: {},
            content: [{ type: "noteLink", props: { noteId: "n-9", title: "Target" } }],
            children: [],
          },
        ],
      },
    ]);

    const converted = convertBlockNoteContent(content);
    expect(converted?.[0]?.flavour).toBe("affine:list");
    expect(converted?.[0]?.props).toEqual({ type: "todo", checked: true });
    const child = converted?.[0]?.children[0];
    expect(child?.props).toEqual({ type: "bulleted" });
    expect(child?.deltas).toEqual([
      { insert: " ", attributes: { reference: { type: "LinkedPage", pageId: "n-9" } } },
    ]);
  });

  it("converts code blocks with language and falls back for unknown types", () => {
    const content = JSON.stringify([
      {
        type: "codeBlock",
        props: { language: "rust" },
        content: [{ type: "text", text: "fn x() {}", styles: {} }],
        children: [],
      },
      { type: "video", props: {}, content: undefined, children: [] },
    ]);

    const converted = convertBlockNoteContent(content);
    expect(converted?.[0]).toEqual({
      flavour: "affine:code",
      props: { language: "rust" },
      deltas: [{ insert: "fn x() {}" }],
      children: [],
    });
    expect(converted?.[1]?.flavour).toBe("affine:paragraph");
  });

  it("returns null for BlockSuite envelopes and non-JSON", () => {
    expect(convertBlockNoteContent(packBlockSuiteContent("AAA="))).toBeNull();
    expect(convertBlockNoteContent("plain text")).toBeNull();
    expect(convertBlockNoteContent("[broken")).toBeNull();
  });
});
