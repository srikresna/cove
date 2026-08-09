import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { BaseAdapter } from '@blocksuite/store';
import { NotificationProvider } from '../../services/notification-service.js';
import { decodeClipboardBlobs, encodeClipboardBlobs } from './utils.js';
export class ClipboardAdapter extends BaseAdapter {
    constructor() {
        super(...arguments);
        this._onError = (message) => {
            const notification = this.provider.getOptional(NotificationProvider);
            if (!notification)
                return;
            notification.toast(message);
        };
    }
    static { this.MIME = 'BLOCKSUITE/SNAPSHOT'; }
    fromBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ClipboardAdapter.fromBlockSnapshot is not implemented');
    }
    fromDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ClipboardAdapter.fromDocSnapshot is not implemented');
    }
    async fromSliceSnapshot(payload) {
        const snapshot = payload.snapshot;
        const assets = payload.assets;
        if (!assets) {
            throw new BlockSuiteError(ErrorCode.ValueNotExists, 'ClipboardAdapter.fromSliceSnapshot: assets is not found');
        }
        const map = assets.getAssets();
        const blobs = await encodeClipboardBlobs(map, this._onError);
        return {
            file: JSON.stringify({
                snapshot,
                blobs,
            }),
            assetsIds: [],
        };
    }
    toBlockSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ClipboardAdapter.toBlockSnapshot is not implemented');
    }
    toDocSnapshot(_payload) {
        throw new BlockSuiteError(ErrorCode.TransformerNotImplementedError, 'ClipboardAdapter.toDocSnapshot is not implemented');
    }
    toSliceSnapshot(payload) {
        const json = JSON.parse(payload.file);
        const { blobs, snapshot } = json;
        const map = payload.assets?.getAssets();
        decodeClipboardBlobs(blobs, map);
        return Promise.resolve(snapshot);
    }
}
