import { insertEmbedCard } from '@blocksuite/affine-block-embed';
export const insertEmbedSyncedDocCommand = (ctx, next) => {
    const { docId, params, std } = ctx;
    const flavour = 'affine:embed-synced-doc';
    const targetStyle = 'syncedDoc';
    const props = { pageId: docId };
    if (params)
        props.params = params;
    const blockId = insertEmbedCard(std, { flavour, targetStyle, props });
    if (!blockId)
        return;
    next({ blockId });
};
