import type { BlockModel } from '@blocksuite/affine/store';
import type { Command, TextSelection } from '@blocksuite/std';
/**
 * Replace the selected text with the given blocks
 *
 * @warning This command is currently being optimized, please do not use it.
 * @param ctx
 * @param next
 * @returns
 */
export declare const replaceSelectedTextWithBlocksCommand: Command<{
    textSelection: TextSelection;
    blocks: BlockModel[];
}>;
//# sourceMappingURL=replace-selected-text-with-blocks.d.ts.map