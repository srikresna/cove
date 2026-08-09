import { type BlockComponent, type Command } from '@blocksuite/std';
/**
 * Focus the end of the block
 * @param focusBlock - The block to focus
 * @param force - If set to true, the selection will be cleared.
 * It is useful when the selection is same.
 */
export declare const focusBlockEnd: Command<{
    focusBlock?: BlockComponent;
    force?: boolean;
}>;
//# sourceMappingURL=focus-block-end.d.ts.map