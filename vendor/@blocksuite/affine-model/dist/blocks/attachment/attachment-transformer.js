import { BaseBlockTransformer } from '@blocksuite/store';
export class AttachmentBlockTransformer extends BaseBlockTransformer {
    async fromSnapshot(payload) {
        const snapshotRet = await super.fromSnapshot(payload);
        const sourceId = snapshotRet.props.sourceId;
        if (!payload.assets.isEmpty() && sourceId)
            await payload.assets.writeToBlob(sourceId);
        return snapshotRet;
    }
    toSnapshot(snapshot) {
        const snapshotRet = super.toSnapshot(snapshot);
        const sourceId = snapshot.model.props.sourceId;
        if (sourceId) {
            const pathBlobIdMap = snapshot.assets.getPathBlobIdMap();
            pathBlobIdMap.set(snapshot.model.id, sourceId);
        }
        return snapshotRet;
    }
}
