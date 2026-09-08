import { describe, expect, it } from "vitest";
import { parseInline, parseMarkdown } from "@/features/editor/markdownPreview";

describe("parseMarkdown", () => {
  it("parses a tweet-save note: title heading, body, images, lists", () => {
    const doc = [
      "# tweet-save-note",
      "",
      "Some **bold** intro with `code`.",
      "",
      "![](assets/JL_gttNtMoU2wM4vkzIyCWKBidiimK6tKQN3F8OlBW4=.png)",
      "",
      "- point one",
      "- point two",
      "",
      "1. first",
      "2. second",
    ].join("\n");

    const blocks = parseMarkdown(doc);
    expect(blocks.map((b) => b.kind)).toEqual([
      "heading",
      "paragraph",
      "paragraph",
      "list",
      "list",
    ]);

    const heading = blocks[0];
    expect(heading?.kind === "heading" && heading.level).toBe(1);

    const imagePara = blocks[2];
    expect(
      imagePara?.kind === "paragraph" &&
        imagePara.children[0]?.kind === "image" &&
        imagePara.children[0].url,
    ).toBe("assets/JL_gttNtMoU2wM4vkzIyCWKBidiimK6tKQN3F8OlBW4=.png");

    const list = blocks[3];
    expect(list?.kind === "list" && list.ordered).toBe(false);
    const ordered = blocks[4];
    expect(ordered?.kind === "list" && ordered.ordered).toBe(true);
  });

  it("parses fenced code blocks without treating their content as markdown", () => {
    const blocks = parseMarkdown("before\n```\n# not a heading\n**not bold**\n```\nafter");
    expect(blocks.map((b) => b.kind)).toEqual(["paragraph", "code", "paragraph"]);
    const code = blocks[1];
    expect(code?.kind === "code" && code.text).toBe("# not a heading\n**not bold**");
  });

  it("parses quotes and horizontal rules", () => {
    const blocks = parseMarkdown("> quoted line\n\n---\n> second quote");
    expect(blocks.map((b) => b.kind)).toEqual(["quote", "hr", "quote"]);
  });

  it("keeps unsupported markup as plain text, never HTML", () => {
    const blocks = parseMarkdown("<script>alert(1)</script>");
    const para = blocks[0];
    expect(para?.kind === "paragraph" && para.children[0]?.kind).toBe("text");
  });

  it("parses captioned images (quoted link titles)", () => {
    const tokens = parseInline('![alt](assets/x.png "My caption")');
    expect(tokens[0]?.kind).toBe("image");
    expect(tokens[0]?.kind === "image" && tokens[0].url).toBe("assets/x.png");
  });

  it("keeps snake_case identifiers literal (no underscore emphasis)", () => {
    const tokens = parseInline("foo_bar_baz stays plain");
    expect(tokens[0]?.kind).toBe("text");
  });

  it("treats degenerate one-liners as plain text instead of quadratic parsing", () => {
    const tokens = parseInline("*".repeat(20000));
    expect(tokens).toHaveLength(1);
    expect(tokens[0]?.kind).toBe("text");
  });
});

describe("parseInline", () => {
  it("parses bold, italic, code, links, and images in one line", () => {
    const tokens = parseInline("a **b** *c* `d` [e](https://x) ![f](assets/g.png)");
    expect(tokens.map((t) => t.kind)).toEqual([
      "text",
      "bold",
      "text",
      "italic",
      "text",
      "code",
      "text",
      "link",
      "text",
      "image",
    ]);
  });

  it("parses bold nested inside italics", () => {
    const tokens = parseInline("*a **b** c*");
    expect(tokens[0]?.kind).toBe("italic");
    const inner = tokens[0]?.kind === "italic" ? tokens[0].children[0] : undefined;
    expect(inner?.kind).toBe("text");
    expect(tokens[0]?.kind === "italic" && tokens[0].children[1]?.kind).toBe("bold");
  });
});
