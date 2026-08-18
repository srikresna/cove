import { extractBlockSuiteParagraphs } from "../services/editor/blockSuiteContent";

const PARAGRAPH_CACHE_CAPACITY = 50;

const paragraphCache = new Map<string, string[]>();

export function extractParagraphs(content: string): string[] {
  if (!content) return [];
  const cached = paragraphCache.get(content);
  if (cached) return cached;
  const paragraphs = extractBlockSuiteParagraphs(content) ?? [];
  if (paragraphCache.size >= PARAGRAPH_CACHE_CAPACITY) {
    const oldest = paragraphCache.keys().next().value;
    if (oldest !== undefined) paragraphCache.delete(oldest);
  }
  paragraphCache.set(content, paragraphs);
  return paragraphs;
}

export function extractPlainText(content: string): string {
  if (!content) return "";
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
