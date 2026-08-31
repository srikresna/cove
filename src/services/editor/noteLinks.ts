import { extractBlockSuiteLinkIds } from "./blockSuiteContent";

export function extractNoteLinkIds(content: string): string[] {
  return extractBlockSuiteLinkIds(content) ?? [];
}
