import type { ServiceProvider } from '@blocksuite/global/di';
import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload, type Transformer } from '@blocksuite/store';
export type MixText = string;
type MixTextToSliceSnapshotPayload = {
    file: MixText;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
export declare class MixTextAdapter extends BaseAdapter<MixText> {
    private readonly _markdownAdapter;
    constructor(job: Transformer, provider: ServiceProvider);
    private _splitDeltas;
    private _traverseSnapshot;
    fromBlockSnapshot({ snapshot, }: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<MixText>>;
    fromDocSnapshot({ snapshot, assets, }: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<MixText>>;
    fromSliceSnapshot({ snapshot, }: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<MixText>>;
    toBlockSnapshot(payload: ToBlockSnapshotPayload<MixText>): BlockSnapshot;
    toDocSnapshot(payload: ToDocSnapshotPayload<MixText>): DocSnapshot;
    toSliceSnapshot(payload: MixTextToSliceSnapshotPayload): Promise<SliceSnapshot | null>;
}
export declare const MixTextAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("./types").AdapterFactory>;
export declare const MixTextAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=mix-text.d.ts.map