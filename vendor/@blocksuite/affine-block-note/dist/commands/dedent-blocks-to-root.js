import { NoteBlockModel } from '@blocksuite/affine-model';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { TextSelection } from '@blocksuite/std';
import { dedentBlockToRoot } from './dedent-block-to-root';
export const dedentBlocksToRoot = (ctx, next) => {
    let { blockIds } = ctx;
    const { std, stopCapture = true } = ctx;
    const { store } = std;
    if (!blockIds || !blockIds.length) {
        const text = std.selection.find(TextSelection);
        if (text) {
            // If the text selection is not at the beginning of the block, use default behavior
            if (text.from.index !== 0)
                return;
            blockIds = [text.from.blockId, text.to?.blockId].filter((x) => !!x);
        }
        else {
            blockIds = std.selection.getGroup('note').map(sel => sel.blockId);
        }
    }
    if (!blockIds || !blockIds.length || store.readonly)
        return;
    if (stopCapture)
        store.captureSync();
    for (let i = blockIds.length - 1; i >= 0; i--) {
        const model = blockIds[i];
        const parent = store.getParent(model);
        if (parent && !matchModels(parent, [NoteBlockModel])) {
            std.command.exec(dedentBlockToRoot, {
                blockId: model,
                stopCapture: false,
            });
        }
    }
    return next();
};
