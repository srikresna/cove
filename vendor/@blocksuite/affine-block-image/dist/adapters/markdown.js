import { ImageBlockSchema } from '@blocksuite/affine-model';
import { BlockMarkdownAdapterExtension, } from '@blocksuite/affine-shared/adapters';
import { getAssetName } from '@blocksuite/store';
import { processImageNodeToBlock } from './utils';
const isImageNode = (node) => node.type === 'image';
export const imageBlockMarkdownAdapterMatcher = {
    flavour: ImageBlockSchema.model.flavour,
    toMatch: o => isImageNode(o.node),
    fromMatch: o => o.node.flavour === ImageBlockSchema.model.flavour,
    toBlockSnapshot: {
        enter: async (o, context) => {
            const { configs, walkerContext, assets } = context;
            const imageURL = 'url' in o.node ? o.node.url : '';
            if (!assets || !imageURL) {
                return;
            }
            await processImageNodeToBlock(imageURL, walkerContext, assets, configs);
        },
    },
    fromBlockSnapshot: {
        enter: async (o, context) => {
            const { assets, walkerContext, updateAssetIds } = context;
            const blobId = (o.node.props.sourceId ?? '');
            if (!assets) {
                return;
            }
            await assets.readFromBlob(blobId);
            const blob = assets.getAssets().get(blobId);
            if (!blob) {
                return;
            }
            const blobName = getAssetName(assets.getAssets(), blobId);
            updateAssetIds?.(blobId);
            walkerContext
                .openNode({
                type: 'paragraph',
                children: [],
            }, 'children')
                .openNode({
                type: 'image',
                url: `assets/${blobName}`,
                title: o.node.props.caption ?? null,
                alt: blob.name ?? null,
            }, 'children')
                .closeNode()
                .closeNode();
        },
    },
};
export const ImageBlockMarkdownAdapterExtension = BlockMarkdownAdapterExtension(imageBlockMarkdownAdapterMatcher);
