import { BlockSelection } from '@blocksuite/std';
export const getBlockSelectionsCommand = (ctx, next) => {
    const currentBlockSelections = ctx.std.selection.filter(BlockSelection);
    if (currentBlockSelections.length === 0)
        return;
    next({ currentBlockSelections });
};
