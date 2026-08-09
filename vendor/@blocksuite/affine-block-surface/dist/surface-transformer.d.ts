import type { SurfaceBlockProps } from '@blocksuite/std/gfx';
import type { FromSnapshotPayload, SnapshotNode, ToSnapshotPayload } from '@blocksuite/store';
import { BaseBlockTransformer } from '@blocksuite/store';
import * as Y from 'yjs';
export declare class SurfaceBlockTransformer extends BaseBlockTransformer<SurfaceBlockProps> {
    private _elementToJSON;
    private _fromJSON;
    private _toJSON;
    elementFromJSON(element: Record<string, unknown>): Y.Map<unknown>;
    fromSnapshot(payload: FromSnapshotPayload): Promise<SnapshotNode<SurfaceBlockProps>>;
    toSnapshot(payload: ToSnapshotPayload<SurfaceBlockProps>): import("@blocksuite/store").BlockSnapshotLeaf;
}
//# sourceMappingURL=surface-transformer.d.ts.map