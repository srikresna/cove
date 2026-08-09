import type { BlockComponent, Command } from '@blocksuite/std';
export declare const getSelectedPeekableBlocksCommand: Command<{
    selectedBlocks: BlockComponent[];
}, {
    selectedPeekableBlocks: BlockComponent[];
}>;
export declare const peekSelectedBlockCommand: Command<{
    selectedBlocks: BlockComponent[];
}>;
//# sourceMappingURL=commands.d.ts.map