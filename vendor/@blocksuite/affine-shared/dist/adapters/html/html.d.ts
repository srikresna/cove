import type { ServiceProvider } from '@blocksuite/global/di';
import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload, type Transformer } from '@blocksuite/store';
import { type BlockHtmlAdapterMatcher } from './block-adapter';
import { HtmlDeltaConverter } from './delta-converter';
export type Html = string;
type HtmlToSliceSnapshotPayload = {
    file: Html;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
export declare class HtmlAdapter extends BaseAdapter<Html> {
    private readonly _astToHtml;
    private readonly _traverseHtml;
    private readonly _traverseSnapshot;
    deltaConverter: HtmlDeltaConverter;
    readonly blockMatchers: BlockHtmlAdapterMatcher[];
    constructor(job: Transformer, provider: ServiceProvider);
    private _htmlToAst;
    fromBlockSnapshot(payload: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<string>>;
    fromDocSnapshot(payload: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<string>>;
    fromSliceSnapshot(payload: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<string>>;
    toBlockSnapshot(payload: ToBlockSnapshotPayload<string>): Promise<BlockSnapshot>;
    toDocSnapshot(payload: ToDocSnapshotPayload<string>): Promise<DocSnapshot>;
    toSliceSnapshot(payload: HtmlToSliceSnapshotPayload): Promise<SliceSnapshot | null>;
}
export declare const HtmlAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("..").AdapterFactory>;
export declare const HtmlAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=html.d.ts.map