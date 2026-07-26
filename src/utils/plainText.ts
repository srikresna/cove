import { extractBlockSuitePlainText } from "../services/editor/blockSuiteContent";

export function extractPlainText(content: string): string {
  if (!content) return "";
  const blockSuiteText = extractBlockSuitePlainText(content);
  if (blockSuiteText !== null) return blockSuiteText;
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith("[")) {
      const blocks = JSON.parse(trimmed) as unknown;
      if (Array.isArray(blocks)) {
        let text = "";
        for (const block of blocks) {
          const inlineContent = block?.content;
          if (inlineContent && Array.isArray(inlineContent)) {
            for (const inline of inlineContent) {
              if (
                inline &&
                typeof inline === "object" &&
                "text" in inline &&
                typeof inline.text === "string"
              ) {
                text += `${inline.text} `;
              }
            }
          }
        }
        return text;
      }
    }
    return content.replace(/<[^>]*>/g, " ");
  } catch {
    return content.replace(/<[^>]*>/g, " ");
  }
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
