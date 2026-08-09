import { BlockSelection, } from '@blocksuite/std';
export const selectBlock = (ctx, next) => {
    const { focusBlock, std } = ctx;
    if (!focusBlock) {
        return;
    }
    const { selection } = std;
    selection.setGroup('note', [
        selection.create(BlockSelection, { blockId: focusBlock.blockId }),
    ]);
    return next();
};
