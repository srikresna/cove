interface InlineNode {
  type?: unknown;
  props?: { noteId?: unknown };
}

interface BlockNode {
  content?: unknown;
  children?: unknown;
}

export function extractNoteLinkIds(content: string): string[] {
  if (!content) return [];
  let blocks: unknown;
  try {
    blocks = JSON.parse(content);
  } catch {
    return [];
  }
  const ids = new Set<string>();

  const visitInline = (items: unknown): void => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      const inline = item as InlineNode;
      if (inline?.type === "noteLink" && typeof inline.props?.noteId === "string") {
        ids.add(inline.props.noteId);
      }
    }
  };

  const visitBlocks = (nodes: unknown): void => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      const block = node as BlockNode;
      visitInline(block?.content);
      visitBlocks(block?.children);
    }
  };

  visitBlocks(blocks);
  return [...ids];
}
