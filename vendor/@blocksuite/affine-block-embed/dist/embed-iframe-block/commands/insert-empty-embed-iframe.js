import { EmbedIframeBlockComponent } from '../embed-iframe-block';
export const insertEmptyEmbedIframeCommand = (ctx, next) => {
    const { selectedModels, place, removeEmptyLine, std, linkInputPopupOptions } = ctx;
    if (!selectedModels?.length)
        return;
    const targetModel = place === 'before'
        ? selectedModels[0]
        : selectedModels[selectedModels.length - 1];
    const embedIframeBlockProps = {
        flavour: 'affine:embed-iframe',
    };
    const result = std.store.addSiblingBlocks(targetModel, [embedIframeBlockProps], place);
    if (result.length === 0)
        return;
    if (removeEmptyLine && targetModel.text?.length === 0) {
        std.store.deleteBlock(targetModel);
    }
    next({
        insertedEmbedIframeBlockId: std.host.updateComplete.then(async () => {
            const blockComponent = std.view.getBlock(result[0]);
            if (blockComponent instanceof EmbedIframeBlockComponent) {
                await blockComponent.updateComplete;
                blockComponent.toggleLinkInputPopup(linkInputPopupOptions);
            }
            return result[0];
        }),
    });
};
