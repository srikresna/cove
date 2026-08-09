import { ImageSelection } from '../../selection/index.js';
export const getImageSelectionsCommand = (ctx, next) => {
    const currentImageSelections = ctx.std.selection.filter(ImageSelection);
    if (currentImageSelections.length === 0)
        return;
    next({ currentImageSelections });
};
