import { AttachmentBlockSchema, } from '@blocksuite/affine-model';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { BaseAdapter, nanoid, } from '@blocksuite/store';
import { AdapterFactoryIdentifier } from './types/adapter';
export function createAttachmentBlockSnapshot({ id = nanoid(), props, }) {
    return {
        type: 'block',
        id,
        flavour: AttachmentBlockSchema.model.flavour,
        props,
        children: [],
    };
}
export class AttachmentAdapter extends BaseAdapter {
    fromBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'AttachmentAdapter.fromBlockSnapshot is not implemented.');
    }
    fromDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'AttachmentAdapter.fromDocSnapshot is not implemented.');
    }
    fromSliceSnapshot(payload) {
        const attachments = [];
        for (const contentSlice of payload.snapshot.content) {
            if (contentSlice.type === 'block') {
                const { flavour, props } = contentSlice;
                if (flavour === 'affine:attachment') {
                    const { sourceId } = props;
                    const file = payload.assets?.getAssets().get(sourceId);
                    if (file) {
                        attachments.push(file);
                    }
                }
            }
        }
        return Promise.resolve({ file: attachments, assetsIds: [] });
    }
    toBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'AttachmentAdapter.toBlockSnapshot is not implemented.');
    }
    toDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'AttachmentAdapter.toDocSnapshot is not implemented.');
    }
    async toSliceSnapshot({ assets, file: files, pageId, workspaceId, }) {
        if (files.length === 0)
            return null;
        const content = [];
        for (const blob of files) {
            const id = nanoid();
            const { name, size, type } = blob;
            assets?.uploadingAssetsMap.set(id, {
                blob,
                mapInto: sourceId => ({ sourceId }),
            });
            content.push(createAttachmentBlockSnapshot({
                id,
                props: {
                    name,
                    size,
                    type,
                    embed: false,
                    style: 'horizontalThin',
                    index: 'a0',
                    xywh: '[0,0,0,0]',
                    rotate: 0,
                },
            }));
        }
        return {
            type: 'slice',
            content,
            pageId,
            workspaceId,
        };
    }
}
export const AttachmentAdapterFactoryIdentifier = AdapterFactoryIdentifier('Attachment');
export const AttachmentAdapterFactoryExtension = {
    setup: di => {
        di.addImpl(AttachmentAdapterFactoryIdentifier, provider => ({
            get: (job) => new AttachmentAdapter(job, provider),
        }));
    },
};
