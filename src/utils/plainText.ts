import { extractBlockSuiteParagraphs } from "../services/editor/blockSuiteContent";
import { walkBlocks } from "./blockTree";

function inlineText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  let text = "";
  for (const inline of content) {
    if (
      inline &&
      typeof inline === "object" &&
      "text" in inline &&
      typeof inline.text === "string"
    ) {
      text += inline.text;
    }
  }
  return text.trim();
}

/** One string per non-empty block, for content previews. */
export function extractParagraphs(content: string): string[] {
  if (!content) return [];
  const blockSuiteParagraphs = extractBlockSuiteParagraphs(content);
  if (blockSuiteParagraphs !== null) return blockSuiteParagraphs;
  const paragraphs: string[] = [];
  walkBlocks(content, (block) => {
    const text = inlineText(block.content);
    if (text) paragraphs.push(text);
  });
  return paragraphs;
}

export function extractPlainText(content: string): string {
  if (!content) return "";
  // Single source of truth: reuse the preview extractor so body search, word
  // counts, and the QuickSearch preview can never drift apart. (Previously this
  // duplicated the inline extraction with a different separator and no trim.)
  return extractParagraphs(content).join(" ").replace(/\s+/g, " ").trim();
}

export function countWordsAndChars(content: string): {
  wordCount: number;
  characterCount: number;
} {
  const cleanText = extractPlainText(content).trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  return { wordCount: words.length, characterCount: cleanText.length };
}

export function buildSnippet(text: string, query: string, maxLen = 80): string {
  if (text.length <= maxLen) return text.trim();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  const center = idx >= 0 ? idx : 0;
  const start = Math.max(0, center - Math.floor(maxLen / 3));
  const slice = text.slice(start, start + maxLen);
  return `${start > 0 ? "…" : ""}${slice.trim()}${start + maxLen < text.length ? "…" : ""}`;
}
