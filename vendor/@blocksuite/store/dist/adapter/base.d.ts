import type { ServiceProvider } from '@blocksuite/global/di';
import { BlockModel, type DraftModel, type Store } from '../model/index.js';
import type { AssetsManager } from '../transformer/assets.js';
import type { Slice, Transformer } from '../transformer/index.js';
import type { BlockSnapshot, DocSnapshot, SliceSnapshot } from '../transformer/type.js';
import { ASTWalkerContext } from './context.js';
export type FromDocSnapshotPayload = {
    snapshot: DocSnapshot;
    assets?: AssetsManager;
};
export type FromBlockSnapshotPayload = {
    snapshot: BlockSnapshot;
    assets?: AssetsManager;
};
export type FromSliceSnapshotPayload = {
    snapshot: SliceSnapshot;
    assets?: AssetsManager;
};
export type FromDocSnapshotResult<Target> = {
    file: Target;
    assetsIds: string[];
};
export type FromBlockSnapshotResult<Target> = {
    file: Target;
    assetsIds: string[];
};
export type FromSliceSnapshotResult<Target> = {
    file: Target;
    assetsIds: string[];
};
export type ToDocSnapshotPayload<Target> = {
    file: Target;
    assets?: AssetsManager;
};
export type ToBlockSnapshotPayload<Target> = {
    file: Target;
    assets?: AssetsManager;
};
export type ToSliceSnapshotPayload<Target> = {
    file: Target;
    assets?: AssetsManager;
};
export declare function wrapFakeNote(snapshot: SliceSnapshot): void;
export declare abstract class BaseAdapter<AdapterTarget = unknown> {
    readonly provider: ServiceProvider;
    job: Transformer;
    get configs(): Map<string, string>;
    constructor(job: Transformer, provider: ServiceProvider);
    fromBlock(model: BlockModel | DraftModel): Promise<FromBlockSnapshotResult<AdapterTarget> | undefined>;
    abstract fromBlockSnapshot(payload: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<AdapterTarget>> | FromBlockSnapshotResult<AdapterTarget>;
    fromDoc(doc: Store): Promise<FromDocSnapshotResult<AdapterTarget> | undefined>;
    abstract fromDocSnapshot(payload: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<AdapterTarget>> | FromDocSnapshotResult<AdapterTarget>;
    fromSlice(slice: Slice): Promise<FromSliceSnapshotResult<AdapterTarget> | undefined>;
    abstract fromSliceSnapshot(payload: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<AdapterTarget>> | FromSliceSnapshotResult<AdapterTarget>;
    toBlock(payload: ToBlockSnapshotPayload<AdapterTarget>, doc: Store, parent?: string, index?: number): Promise<BlockModel<object> | undefined>;
    abstract toBlockSnapshot(payload: ToBlockSnapshotPayload<AdapterTarget>): Promise<BlockSnapshot> | BlockSnapshot;
    toDoc(payload: ToDocSnapshotPayload<AdapterTarget>): Promise<Store | undefined>;
    abstract toDocSnapshot(payload: ToDocSnapshotPayload<AdapterTarget>): Promise<DocSnapshot> | DocSnapshot;
    toSlice(payload: ToSliceSnapshotPayload<AdapterTarget>, doc: Store, parent?: string, index?: number): Promise<Slice | undefined>;
    abstract toSliceSnapshot(payload: ToSliceSnapshotPayload<AdapterTarget>): Promise<SliceSnapshot | null> | SliceSnapshot | null;
}
type Keyof<T> = T extends unknown ? keyof T : never;
type WalkerFn<ONode extends object, TNode extends object> = (o: NodeProps<ONode>, context: ASTWalkerContext<TNode>) => Promise<void> | void;
export type NodeProps<Node extends object> = {
    node: Node;
    next?: Node | null;
    parent: NodeProps<Node> | null;
    prop: Keyof<Node> | null;
    index: number | null;
};
export declare class ASTWalker<ONode extends object, TNode extends object | never> {
    private _enter;
    private _isONode;
    private _leave;
    private readonly _visit;
    private readonly context;
    setEnter: (fn: WalkerFn<ONode, TNode>) => void;
    setLeave: (fn: WalkerFn<ONode, TNode>) => void;
    setONodeTypeGuard: (fn: (node: unknown) => node is ONode) => void;
    walk: (oNode: ONode, tNode: TNode) => Promise<TNode>;
    walkONode: (oNode: ONode) => Promise<void>;
    constructor();
}
export {};
//# sourceMappingURL=base.d.ts.map