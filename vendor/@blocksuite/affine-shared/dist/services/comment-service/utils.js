import { CommentIcon } from '@blocksuite/icons/lit';
import { BlockSelection, SurfaceSelection } from '@blocksuite/std';
import { BlockModel } from '@blocksuite/store';
import { CommentProviderIdentifier } from './comment-provider';
export function findAllCommentedBlocks(store) {
    return store.getAllModels().filter((block) => {
        return ('comments' in block.props &&
            typeof block.props.comments === 'object' &&
            block.props.comments !== null);
    });
}
export function findCommentedBlocks(store, commentId) {
    return findAllCommentedBlocks(store).filter(block => {
        return block.props.comments[commentId];
    });
}
export function findAllCommentedElements(store) {
    const surface = store.getModelsByFlavour('affine:surface')[0];
    if (!surface)
        return [];
    return surface.elementModels.filter((element) => {
        return (element.comments !== undefined &&
            Object.keys(element.comments).length > 0);
    });
}
export function findCommentedElements(store, commentId) {
    return findAllCommentedElements(store).filter(element => {
        return element.comments[commentId];
    });
}
export const blockCommentToolbarButton = {
    tooltip: 'Comment',
    when: ({ std }) => !!std.getOptional(CommentProviderIdentifier),
    icon: CommentIcon(),
    run: ctx => {
        const commentProvider = ctx.std.getOptional(CommentProviderIdentifier);
        if (!commentProvider)
            return;
        const selections = ctx.selection.value;
        const model = ctx.getCurrentModel();
        // may be hover on a block or element, in this case
        // the selection is empty, so we need to get the current model
        if (model) {
            if (model instanceof BlockModel) {
                commentProvider.addComment([
                    new BlockSelection({
                        blockId: model.id,
                    }),
                ]);
            }
            else if (ctx.gfx.surface?.id) {
                commentProvider.addComment([
                    new SurfaceSelection(ctx.gfx.surface.id, [model.id], false),
                ]);
            }
        }
        else if (selections.length > 0) {
            commentProvider.addComment(selections);
        }
    },
};
