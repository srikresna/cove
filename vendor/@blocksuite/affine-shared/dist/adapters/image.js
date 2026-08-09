import { ImageBlockSchema } from '@blocksuite/affine-model';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { BaseAdapter, nanoid, } from '@blocksuite/store';
import { AdapterFactoryIdentifier } from './types/adapter';
export class ImageAdapter extends BaseAdapter {
    fromBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ImageAdapter.fromBlockSnapshot is not implemented.');
    }
    fromDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ImageAdapter.fromDocSnapshot is not implemented.');
    }
    fromSliceSnapshot(payload) {
        const images = [];
        for (const contentSlice of payload.snapshot.content) {
            if (contentSlice.type === 'block') {
                const { flavour, props } = contentSlice;
                if (flavour === 'affine:image') {
                    const { sourceId } = props;
                    const file = payload.assets?.getAssets().get(sourceId);
                    if (file) {
                        images.push(file);
                    }
                }
            }
        }
        return Promise.resolve({ file: images, assetsIds: [] });
    }
    toBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ImageAdapter.toBlockSnapshot is not implemented.');
    }
    toDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ImageAdapter.toDocSnapshot is not implemented');
    }
    async toSliceSnapshot({ assets, file: files, pageId, workspaceId, }) {
        if (files.length === 0)
            return null;
        const content = [];
        const flavour = ImageBlockSchema.model.flavour;
        for (const blob of files) {
            const id = nanoid();
            const { size } = blob;
            assets?.uploadingAssetsMap.set(id, {
                blob,
                mapInto: sourceId => ({ sourceId }),
            });
            content.push({
                type: 'block',
                flavour,
                id,
                props: { size },
                children: [],
            });
        }
        return {
            type: 'slice',
            content,
            pageId,
            workspaceId,
        };
    }
}
export const ImageAdapterFactoryIdentifier = AdapterFactoryIdentifier('Image');
export const ImageAdapterFactoryExtension = {
    setup: di => {
        di.addImpl(ImageAdapterFactoryIdentifier, provider => ({
            get: (job) => new ImageAdapter(job, provider),
        }));
    },
};
