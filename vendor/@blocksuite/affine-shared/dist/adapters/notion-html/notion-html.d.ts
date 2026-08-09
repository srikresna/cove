import type { ServiceProvider } from '@blocksuite/global/di';
import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type Transformer } from '@blocksuite/store';
import { type BlockNotionHtmlAdapterMatcher } from './block-adapter';
import { NotionHtmlDeltaConverter } from './delta-converter';
export type NotionHtml = string;
type NotionHtmlToSliceSnapshotPayload = {
    file: NotionHtml;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
type NotionHtmlToDocSnapshotPayload = {
    file: NotionHtml;
    assets?: AssetsManager;
    pageId?: string;
    pageMap?: Map<string, string>;
};
type NotionHtmlToBlockSnapshotPayload = NotionHtmlToDocSnapshotPayload;
export declare class NotionHtmlAdapter extends BaseAdapter<NotionHtml> {
    private readonly _traverseNotionHtml;
    deltaConverter: NotionHtmlDeltaConverter;
    readonly blockMatchers: BlockNotionHtmlAdapterMatcher[];
    constructor(job: Transformer, provider: ServiceProvider);
    private _htmlToAst;
    fromBlockSnapshot(_payload: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<NotionHtml>>;
    fromDocSnapshot(_payload: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<NotionHtml>>;
    fromSliceSnapshot(_payload: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<NotionHtml>>;
    toBlockSnapshot(payload: NotionHtmlToBlockSnapshotPayload): Promise<BlockSnapshot>;
    toDoc(payload: NotionHtmlToDocSnapshotPayload): Promise<import("@blocksuite/store").Store | undefined>;
    toDocSnapshot(payload: NotionHtmlToDocSnapshotPayload): Promise<DocSnapshot>;
    toSliceSnapshot(payload: NotionHtmlToSliceSnapshotPayload): Promise<SliceSnapshot | null>;
}
export declare const NotionHtmlAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("..").AdapterFactory>;
export declare const NotionHtmlAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=notion-html.d.ts.map