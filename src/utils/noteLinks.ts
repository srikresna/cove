import { extractBlockSuiteLinkIds } from "../services/editor/blockSuiteContent";

export function extractNoteLinkIds(content: string): string[] {
  return extractBlockSuiteLinkIds(content) ?? [];
}
