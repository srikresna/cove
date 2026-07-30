import { extractBlockSuiteLinkIds } from "../services/editor/blockSuiteContent";

/** Linked-doc ids referenced by a BlockSuite envelope (reference deltas). */
export function extractNoteLinkIds(content: string): string[] {
  return extractBlockSuiteLinkIds(content) ?? [];
}
