import { getBlockSelectionsCommand, getSelectedBlocksCommand, getTextSelectionCommand, } from '@blocksuite/affine-shared/commands';
import { isPeekable, peek } from './peekable.js';
const getSelectedPeekableBlocks = (cmd) => {
    const [result, ctx] = cmd.std.command
        .chain()
        .tryAll(chain => [
        chain.pipe(getTextSelectionCommand),
        chain.pipe(getBlockSelectionsCommand),
    ])
        .pipe(getSelectedBlocksCommand, { types: ['text', 'block'] })
        .run();
    return ((result ? ctx.selectedBlocks : []) || []).filter(isPeekable);
};
export const getSelectedPeekableBlocksCommand = (ctx, next) => {
    const selectedPeekableBlocks = getSelectedPeekableBlocks(ctx);
    if (selectedPeekableBlocks.length > 0) {
        next({ selectedPeekableBlocks });
    }
};
export const peekSelectedBlockCommand = (ctx, next) => {
    const peekableBlocks = getSelectedPeekableBlocks(ctx);
    // if there are multiple blocks, peek the first one
    const block = peekableBlocks.at(0);
    if (block) {
        peek(block);
        next();
    }
};
