import type { BlockComponent, Command } from '@blocksuite/std';
export declare const getBlockIndexCommand: Command<{
    currentSelectionPath?: string;
    path?: string;
}, {
    blockIndex?: number;
    parentBlock?: BlockComponent;
}>;
//# sourceMappingURL=get-block-index.d.ts.map