import { BlockModel } from '../model/block/block-model';
import { type DraftModel } from '../model/block/draft';
import { type InternalPrimitives } from '../model/block/zod';
import type { AssetsManager } from './assets';
import type { BlockSnapshot } from './type';
export type BlockSnapshotLeaf = Pick<BlockSnapshot, 'id' | 'flavour' | 'props' | 'version'>;
export type FromSnapshotPayload = {
    json: BlockSnapshotLeaf;
    assets: AssetsManager;
    children: BlockSnapshot[];
};
export type ToSnapshotPayload<Props extends object> = {
    model: DraftModel<BlockModel<Props>> | BlockModel<Props>;
    assets: AssetsManager;
};
export type SnapshotNode<Props extends object> = {
    id: string;
    flavour: string;
    version: number;
    props: Props;
};
export declare class BaseBlockTransformer<Props extends object = object> {
    readonly transformerConfigs: Map<string, unknown>;
    protected _internal: InternalPrimitives;
    protected _propsFromSnapshot(propsJson: Record<string, unknown>): Props;
    protected _propsToSnapshot(model: DraftModel | BlockModel): {
        [k: string]: unknown;
    };
    constructor(transformerConfigs: Map<string, unknown>);
    fromSnapshot({ json, }: FromSnapshotPayload): Promise<SnapshotNode<Props>> | SnapshotNode<Props>;
    toSnapshot({ model }: ToSnapshotPayload<Props>): BlockSnapshotLeaf;
}
//# sourceMappingURL=base.d.ts.map