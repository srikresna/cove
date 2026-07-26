import * as Y from "yjs";
import { unpackBlockSuiteContent } from "./contentFormat";
import { docFromSnapshot } from "./yjsCodec";

type YBlock = Y.Map<unknown>;

function textOf(block: YBlock, key: string): string {
  const value = block.get(key);
  return value instanceof Y.Text ? value.toString() : "";
}

function childrenOf(block: YBlock): string[] {
  const value = block.get("sys:children");
  if (!(value instanceof Y.Array)) return [];
  return value.toArray().filter((item): item is string => typeof item === "string");
}

function blocksInTreeOrder(blocks: Y.Map<unknown>): YBlock[] {
  let rootId: string | null = null;
  for (const [key, value] of blocks.entries()) {
    if (value instanceof Y.Map && value.get("sys:flavour") === "affine:page") {
      rootId = key;
    }
  }

  const ordered: YBlock[] = [];
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const block = blocks.get(id);
    if (!(block instanceof Y.Map)) return;
    ordered.push(block);
    for (const child of childrenOf(block)) {
      visit(child);
    }
  };
  if (rootId) visit(rootId);

  const reachable = new Set(ordered);
  for (const value of blocks.values()) {
    if (value instanceof Y.Map && !reachable.has(value)) {
      ordered.push(value);
    }
  }
  return ordered;
}

/** One string per non-empty block, in document order; null if not an envelope. */
export function extractBlockSuiteParagraphs(content: string): string[] | null {
  const update = unpackBlockSuiteContent(content);
  if (update === null) return null;
  const doc = docFromSnapshot(update);
  const parts: string[] = [];
  for (const block of blocksInTreeOrder(doc.getMap("blocks"))) {
    const title = textOf(block, "prop:title");
    const text = textOf(block, "prop:text");
    if (title.trim()) parts.push(title.trim());
    if (text.trim()) parts.push(text.trim());
  }
  return parts;
}

/** Plaintext of a BlockSuite envelope in document order, or null if not one. */
export function extractBlockSuitePlainText(content: string): string | null {
  const paragraphs = extractBlockSuiteParagraphs(content);
  if (paragraphs === null) return null;
  return paragraphs.join(" ").replace(/\s+/g, " ").trim();
}

export interface BlockSuiteHeading {
  id: string;
  text: string;
  level: number;
}

const HEADING_LEVELS: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

/** Headings of a BlockSuite envelope in document order, or null if not one. */
export function extractBlockSuiteHeadings(content: string): BlockSuiteHeading[] | null {
  const update = unpackBlockSuiteContent(content);
  if (update === null) return null;
  const doc = docFromSnapshot(update);
  const items: BlockSuiteHeading[] = [];
  for (const block of blocksInTreeOrder(doc.getMap("blocks"))) {
    const type = block.get("prop:type");
    const level = typeof type === "string" ? HEADING_LEVELS[type] : undefined;
    if (!level) continue;
    const id = block.get("sys:id");
    const text = textOf(block, "prop:text").trim();
    if (typeof id !== "string" || !text) continue;
    items.push({ id, text, level });
  }
  return items;
}

interface ReferenceDelta {
  attributes?: { reference?: { pageId?: unknown } };
}

/** Linked doc ids referenced by a BlockSuite envelope, or null if not one. */
export function extractBlockSuiteLinkIds(content: string): string[] | null {
  const update = unpackBlockSuiteContent(content);
  if (update === null) return null;
  const doc = docFromSnapshot(update);
  const ids = new Set<string>();
  for (const block of doc.getMap("blocks").values()) {
    if (!(block instanceof Y.Map)) continue;
    for (const value of block.values()) {
      if (!(value instanceof Y.Text)) continue;
      for (const op of value.toDelta() as ReferenceDelta[]) {
        const pageId = op.attributes?.reference?.pageId;
        if (typeof pageId === "string") ids.add(pageId);
      }
    }
  }
  return [...ids];
}
