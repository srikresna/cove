import { extractBlockSuiteLinkIds } from "../services/editor/blockSuiteContent";
import { walkBlocks } from "./blockTree";

interface InlineNode {
  type?: unknown;
  props?: { noteId?: unknown };
}

export function extractNoteLinkIds(content: string): string[] {
  const blockSuiteIds = extractBlockSuiteLinkIds(content);
  if (blockSuiteIds !== null) return blockSuiteIds;
  const ids = new Set<string>();
  walkBlocks(content, (block) => {
    if (!Array.isArray(block.content)) return;
    for (const item of block.content) {
      const inline = item as InlineNode;
      if (inline?.type === "noteLink" && typeof inline.props?.noteId === "string") {
        ids.add(inline.props.noteId);
      }
    }
  });
  return [...ids];
}
