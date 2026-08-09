import type { BlockSnapshotLeaf, FromSnapshotPayload, SnapshotNode, ToSnapshotPayload } from '@blocksuite/store';
import { BaseBlockTransformer } from '@blocksuite/store';
import type { ImageBlockProps } from './image-model.js';
export declare class ImageBlockTransformer extends BaseBlockTransformer<ImageBlockProps> {
    fromSnapshot(payload: FromSnapshotPayload): Promise<SnapshotNode<ImageBlockProps>>;
    toSnapshot(snapshot: ToSnapshotPayload<ImageBlockProps>): BlockSnapshotLeaf;
}
//# sourceMappingURL=image-transformer.d.ts.map