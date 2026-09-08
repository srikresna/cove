import type React from "react";

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold"; children: InlineToken[] }
  | { kind: "italic"; children: InlineToken[] }
  | { kind: "code"; text: string }
  | { kind: "link"; text: string; url: string }
  | { kind: "image"; alt: string; url: string };

export type BlockToken =
  | { kind: "heading"; level: number; children: InlineToken[] }
  | { kind: "paragraph"; children: InlineToken[] }
  | { kind: "quote"; lines: InlineToken[][] }
  | { kind: "list"; ordered: boolean; items: InlineToken[][] }
  | { kind: "code"; text: string }
  | { kind: "hr" };

const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
const BOLD_RE = /\*\*([^*]+)\*\*/;
const ITALIC_RE =
  /(?<!\*)\*((?:[^*\n]|\*\*[^*\n]+\*\*)+)\*(?!\*)|(?<![A-Za-z0-9_])_([^_\n]+)_(?![A-Za-z0-9_])/;

const MAX_INLINE_LENGTH = 8000;

export function parseInline(line: string): InlineToken[] {
  if (line.length > MAX_INLINE_LENGTH) {
    return [{ kind: "text", text: line }];
  }
  const tokens: InlineToken[] = [];
  let rest = line;
  let buffer = "";

  const flush = () => {
    if (buffer) {
      tokens.push({ kind: "text", text: buffer });
      buffer = "";
    }
  };

  while (rest) {
    const image = rest.match(IMAGE_RE);
    const link = rest.match(LINK_RE);
    const bold = rest.match(BOLD_RE);
    const italic = rest.match(ITALIC_RE);

    const codeStart = (() => {
      const open = rest.indexOf("`");
      if (open === -1) return null;
      const close = rest.indexOf("`", open + 1);
      return close === -1 ? null : { open, close };
    })();

    const candidates: Array<{ at: number; take: () => void }> = [
      ...(image
        ? [
            {
              at: rest.indexOf(image[0]),
              take: () => {
                flush();
                tokens.push({ kind: "image", alt: image[1] ?? "", url: image[2] ?? "" });
                rest = rest.slice(image[0].length);
              },
            },
          ]
        : []),
      ...(link
        ? [
            {
              at: rest.indexOf(link[0]),
              take: () => {
                flush();
                tokens.push({ kind: "link", text: link[1] ?? "", url: link[2] ?? "" });
                rest = rest.slice(link[0].length);
              },
            },
          ]
        : []),
      ...(bold
        ? [
            {
              at: rest.indexOf(bold[0]),
              take: () => {
                flush();
                tokens.push({ kind: "bold", children: parseInline(bold[1] ?? "") });
                rest = rest.slice(bold[0].length);
              },
            },
          ]
        : []),
      ...(italic
        ? [
            {
              at: rest.indexOf(italic[0]),
              take: () => {
                flush();
                const inner = (italic[1] ?? italic[2] ?? "") as string;
                tokens.push({ kind: "italic", children: parseInline(inner) });
                rest = rest.slice(italic[0].length);
              },
            },
          ]
        : []),
      ...(codeStart
        ? [
            {
              at: codeStart.open,
              take: () => {
                flush();
                const close = rest.indexOf("`", 1);
                tokens.push({ kind: "code", text: rest.slice(1, close) });
                rest = rest.slice(close + 1);
              },
            },
          ]
        : []),
    ];

    const winner = candidates.sort((a, b) => a.at - b.at)[0];
    if (!winner) {
      buffer += rest;
      rest = "";
      break;
    }
    buffer += rest.slice(0, winner.at);
    rest = rest.slice(winner.at);
    flush();
    winner.take();
  }

  flush();
  return tokens;
}

export function parseMarkdown(doc: string): BlockToken[] {
  const lines = doc.split(/\r?\n/);
  const blocks: BlockToken[] = [];

  const pushParagraph = (line: string) => {
    blocks.push({ kind: "paragraph", children: parseInline(line) });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const fence = line.match(/^\s*```/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i] ?? "")) {
        code.push(lines[i] ?? "");
        i++;
      }
      blocks.push({ kind: "code", text: code.join("\n") });
      continue;
    }

    if (!line.trim()) continue;

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1]?.length ?? 1,
        children: parseInline(heading[2] ?? ""),
      });
      continue;
    }

    if (/^\s*(---+|\*\*\*+|___+)\s*$/.test(line)) {
      blocks.push({ kind: "hr" });
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      const quoteLines: InlineToken[][] = [parseInline(quote[1] ?? "")];
      i++;
      while (i < lines.length) {
        const next = lines[i]?.match(/^>\s?(.*)$/);
        if (!next) break;
        quoteLines.push(parseInline(next[1] ?? ""));
        i++;
      }
      i--;
      blocks.push({ kind: "quote", lines: quoteLines });
      continue;
    }

    const list = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (list) {
      const ordered = /\d+\./.test(list[2] ?? "");
      const items: InlineToken[][] = [parseInline(list[3] ?? "")];
      i++;
      while (i < lines.length) {
        const next = lines[i]?.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
        if (!next) break;
        items.push(parseInline(next[2] ?? ""));
        i++;
      }
      i--;
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    pushParagraph(line.trim());
  }

  return blocks;
}

export function InlineTokens({
  tokens,
  resolveImage,
}: {
  tokens: InlineToken[];
  resolveImage?: (url: string) => string | undefined;
}): React.ReactNode {
  return (
    <>
      {tokens.map((token, i) => {
        switch (token.kind) {
          case "text":
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                key={i}
              >
                {token.text}
              </span>
            );
          case "bold":
            return (
              <strong
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                key={i}
              >
                <InlineTokens tokens={token.children} resolveImage={resolveImage} />
              </strong>
            );
          case "italic":
            return (
              <em
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                key={i}
              >
                <InlineTokens tokens={token.children} resolveImage={resolveImage} />
              </em>
            );
          case "code":
            return (
              <code
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                key={i}
                className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
              >
                {token.text}
              </code>
            );
          case "link":
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                key={i}
                className="text-primary underline underline-offset-2"
              >
                {token.text}
              </span>
            );
          case "image": {
            const src = resolveImage?.(token.url);
            if (src) {
              return (
                <img
                  // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                  key={i}
                  src={src}
                  alt={token.alt}
                  className="my-1 max-h-64 max-w-full rounded-md border"
                  loading="lazy"
                />
              );
            }
            return (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed tokens are positional and never reordered
                key={i}
                className="my-1 inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs text-muted-foreground"
              >
                [image{token.alt ? `: ${token.alt}` : ""}]
              </span>
            );
          }
        }
        return null;
      })}
    </>
  );
}

export function MarkdownBlocks({
  blocks,
  resolveImage,
}: {
  blocks: BlockToken[];
  resolveImage?: (url: string) => string | undefined;
}): React.ReactNode {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading": {
            const Tag = `h${Math.min(block.level + 2, 6)}` as
              | "h1"
              | "h2"
              | "h3"
              | "h4"
              | "h5"
              | "h6";
            return (
              <Tag
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reordered
                key={i}
                className="mt-3 mb-1 font-semibold first:mt-0"
              >
                <InlineTokens tokens={block.children} resolveImage={resolveImage} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reordered
                key={i}
                className="my-1.5 leading-relaxed"
              >
                <InlineTokens tokens={block.children} resolveImage={resolveImage} />
              </p>
            );
          case "quote":
            return (
              <blockquote
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reordered
                key={i}
                className="my-2 border-l-2 border-border pl-3 text-muted-foreground"
              >
                {block.lines.map((line, j) => (
                  <p
                    // biome-ignore lint/suspicious/noArrayIndexKey: quote lines are positional
                    key={j}
                    className="my-0.5"
                  >
                    <InlineTokens tokens={line} resolveImage={resolveImage} />
                  </p>
                ))}
              </blockquote>
            );
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reordered
                key={i}
                className={`my-2 ${block.ordered ? "list-decimal" : "list-disc"} pl-5`}
              >
                {block.items.map((item, j) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: list items are positional
                    key={j}
                    className="my-0.5"
                  >
                    <InlineTokens tokens={item} resolveImage={resolveImage} />
                  </li>
                ))}
              </ListTag>
            );
          }
          case "code":
            return (
              <pre
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reordered
                key={i}
                className="my-2 overflow-x-auto rounded-md bg-muted p-2 font-mono text-[11px] leading-relaxed"
              >
                {block.text}
              </pre>
            );
          case "hr":
            return (
              <hr
                // biome-ignore lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reordered
                key={i}
                className="my-3 border-border"
              />
            );
        }
        return null;
      })}
    </>
  );
}
