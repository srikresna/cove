import type { BlockSnapshotLeaf, FromSnapshotPayload, SnapshotNode, ToSnapshotPayload } from '@blocksuite/store';
import { BaseBlockTransformer } from '@blocksuite/store';
import type { AttachmentBlockProps } from './attachment-model.js';
export declare class AttachmentBlockTransformer extends BaseBlockTransformer<AttachmentBlockProps> {
    fromSnapshot(payload: FromSnapshotPayload): Promise<SnapshotNode<AttachmentBlockProps>>;
    toSnapshot(snapshot: ToSnapshotPayload<AttachmentBlockProps>): BlockSnapshotLeaf;
}
//# sourceMappingURL=attachment-transformer.d.ts.map