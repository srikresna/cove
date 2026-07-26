export interface BlockNode {
  id?: unknown;
  type?: unknown;
  props?: Record<string, unknown>;
  content?: unknown;
  children?: unknown;
}

export function walkBlocks(content: string, visit: (block: BlockNode) => void): void {
  if (!content) return;
  let blocks: unknown;
  try {
    blocks = JSON.parse(content);
  } catch {
    return;
  }
  const recurse = (nodes: unknown): void => {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      const block = node as BlockNode;
      visit(block);
      recurse(block?.children);
    }
  };
  recurse(blocks);
}
