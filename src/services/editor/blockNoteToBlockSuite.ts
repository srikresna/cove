export interface TextDelta {
  insert: string;
  attributes?: Record<string, unknown>;
}

export interface ConvertedBlock {
  flavour: "affine:paragraph" | "affine:list" | "affine:code";
  props: Record<string, unknown>;
  deltas: TextDelta[];
  children: ConvertedBlock[];
}

interface BlockNoteInline {
  type?: unknown;
  text?: unknown;
  href?: unknown;
  content?: unknown;
  styles?: Record<string, unknown>;
  props?: { noteId?: unknown };
}

interface BlockNoteBlock {
  type?: unknown;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: unknown;
}

const STYLE_TO_ATTRIBUTE: ReadonlyArray<[string, string]> = [
  ["bold", "bold"],
  ["italic", "italic"],
  ["underline", "underline"],
  ["strike", "strike"],
  ["code", "code"],
];

function textDelta(text: string, styles?: Record<string, unknown>, href?: string): TextDelta {
  const attributes: Record<string, unknown> = {};
  for (const [style, attribute] of STYLE_TO_ATTRIBUTE) {
    if (styles?.[style] === true) attributes[attribute] = true;
  }
  if (href) attributes.link = href;
  return Object.keys(attributes).length > 0 ? { insert: text, attributes } : { insert: text };
}

function inlineToDeltas(content: unknown): TextDelta[] {
  if (!Array.isArray(content)) return [];
  const deltas: TextDelta[] = [];
  for (const item of content as BlockNoteInline[]) {
    if (item?.type === "text" && typeof item.text === "string") {
      deltas.push(textDelta(item.text, item.styles));
    } else if (item?.type === "link" && typeof item.href === "string") {
      for (const sub of Array.isArray(item.content) ? (item.content as BlockNoteInline[]) : []) {
        if (sub?.type === "text" && typeof sub.text === "string") {
          deltas.push(textDelta(sub.text, sub.styles, item.href));
        }
      }
    } else if (item?.type === "noteLink" && typeof item.props?.noteId === "string") {
      deltas.push({
        insert: " ",
        attributes: { reference: { type: "LinkedPage", pageId: item.props.noteId } },
      });
    }
  }
  return deltas;
}

function tableToParagraphs(content: unknown): ConvertedBlock[] {
  const rows = (content as { rows?: unknown })?.rows;
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const cells = (row as { cells?: unknown })?.cells;
    const deltas: TextDelta[] = [];
    if (Array.isArray(cells)) {
      cells.forEach((cell, index) => {
        if (index > 0) deltas.push({ insert: " | " });
        deltas.push(...inlineToDeltas(cell));
      });
    }
    return { flavour: "affine:paragraph" as const, props: { type: "text" }, deltas, children: [] };
  });
}

function convertBlock(block: BlockNoteBlock): ConvertedBlock[] {
  const children = Array.isArray(block.children)
    ? (block.children as BlockNoteBlock[]).flatMap(convertBlock)
    : [];
  const deltas = inlineToDeltas(block.content);

  switch (block.type) {
    case "heading": {
      const level = typeof block.props?.level === "number" ? block.props.level : 1;
      const type = level === 2 ? "h2" : level === 3 ? "h3" : "h1";
      return [{ flavour: "affine:paragraph", props: { type }, deltas, children }];
    }
    case "quote":
      return [{ flavour: "affine:paragraph", props: { type: "quote" }, deltas, children }];
    case "bulletListItem":
      return [{ flavour: "affine:list", props: { type: "bulleted" }, deltas, children }];
    case "numberedListItem":
      return [{ flavour: "affine:list", props: { type: "numbered" }, deltas, children }];
    case "checkListItem":
      return [
        {
          flavour: "affine:list",
          props: { type: "todo", checked: block.props?.checked === true },
          deltas,
          children,
        },
      ];
    case "codeBlock": {
      const language = typeof block.props?.language === "string" ? block.props.language : "plain";
      return [{ flavour: "affine:code", props: { language }, deltas, children: [] }];
    }
    case "table": {
      const rows = tableToParagraphs(block.content);
      return rows.length > 0
        ? rows
        : [{ flavour: "affine:paragraph", props: { type: "text" }, deltas, children }];
    }
    default:
      return [{ flavour: "affine:paragraph", props: { type: "text" }, deltas, children }];
  }
}

/** BlockNote document JSON → BlockSuite block tree, or null if not BlockNote. */
export function convertBlockNoteContent(content: string): ConvertedBlock[] | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("[")) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  return (parsed as BlockNoteBlock[]).flatMap(convertBlock);
}
