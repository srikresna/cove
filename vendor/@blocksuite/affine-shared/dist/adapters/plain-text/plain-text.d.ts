import type { ServiceProvider } from '@blocksuite/global/di';
import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload, type Transformer } from '@blocksuite/store';
import { type BlockPlainTextAdapterMatcher } from './block-adapter';
import { PlainTextDeltaConverter } from './delta-converter';
export type PlainText = string;
type PlainTextToSliceSnapshotPayload = {
    file: PlainText;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
export declare class PlainTextAdapter extends BaseAdapter<PlainText> {
    deltaConverter: PlainTextDeltaConverter;
    readonly blockMatchers: BlockPlainTextAdapterMatcher[];
    constructor(job: Transformer, provider: ServiceProvider);
    private _traverseSnapshot;
    fromBlockSnapshot({ snapshot, }: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<PlainText>>;
    fromDocSnapshot({ snapshot, assets, }: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<PlainText>>;
    fromSliceSnapshot({ snapshot, }: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<PlainText>>;
    toBlockSnapshot(payload: ToBlockSnapshotPayload<PlainText>): BlockSnapshot;
    toDocSnapshot(payload: ToDocSnapshotPayload<PlainText>): DocSnapshot;
    toSliceSnapshot(payload: PlainTextToSliceSnapshotPayload): SliceSnapshot | null;
}
export declare const PlainTextAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("..").AdapterFactory>;
export declare const PlainTextAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=plain-text.d.ts.map