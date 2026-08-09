import { insertEmbedCard } from '@blocksuite/affine-block-embed';
export const insertEmbedLinkedDocCommand = (ctx, next) => {
    const { docId, params, std } = ctx;
    const flavour = 'affine:embed-linked-doc';
    const targetStyle = 'vertical';
    const props = { pageId: docId };
    if (params)
        props.params = params;
    const blockId = insertEmbedCard(std, { flavour, targetStyle, props });
    if (!blockId)
        return;
    next({ blockId });
};
