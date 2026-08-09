import { BlockSelection, TextSelection } from '@blocksuite/std';
import { ImageSelection } from '../../selection';
export const isNothingSelectedCommand = (ctx, next) => {
    const textSelection = ctx.currentTextSelection || ctx.std.selection.find(TextSelection);
    const imageSelections = ctx.currentImageSelections || ctx.std.selection.filter(ImageSelection);
    const blockSelections = ctx.currentBlockSelections || ctx.std.selection.filter(BlockSelection);
    const isNothingSelected = !textSelection &&
        imageSelections.length === 0 &&
        blockSelections.length === 0;
    next({ isNothingSelected });
};
