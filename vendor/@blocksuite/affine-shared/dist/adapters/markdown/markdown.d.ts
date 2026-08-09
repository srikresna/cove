import type { ServiceProvider } from '@blocksuite/global/di';
import { type AssetsManager, BaseAdapter, type BlockSnapshot, type DocSnapshot, type ExtensionType, type FromBlockSnapshotPayload, type FromBlockSnapshotResult, type FromDocSnapshotPayload, type FromDocSnapshotResult, type FromSliceSnapshotPayload, type FromSliceSnapshotResult, type SliceSnapshot, type ToBlockSnapshotPayload, type ToDocSnapshotPayload, type Transformer } from '@blocksuite/store';
import { type BlockMarkdownAdapterMatcher } from './block-adapter';
import { MarkdownDeltaConverter } from './delta-converter';
import { MarkdownPreprocessorManager } from './preprocessor';
import type { Markdown } from './type';
type MarkdownToSliceSnapshotPayload = {
    file: Markdown;
    assets?: AssetsManager;
    workspaceId: string;
    pageId: string;
};
export declare class MarkdownAdapter extends BaseAdapter<Markdown> {
    private readonly _traverseMarkdown;
    private readonly _traverseSnapshot;
    deltaConverter: MarkdownDeltaConverter;
    preprocessorManager: MarkdownPreprocessorManager;
    readonly blockMatchers: BlockMarkdownAdapterMatcher[];
    constructor(job: Transformer, provider: ServiceProvider);
    private _astToMarkdown;
    private _markdownToAst;
    fromBlockSnapshot({ snapshot, assets, }: FromBlockSnapshotPayload): Promise<FromBlockSnapshotResult<Markdown>>;
    fromDocSnapshot({ snapshot, assets, }: FromDocSnapshotPayload): Promise<FromDocSnapshotResult<Markdown>>;
    fromSliceSnapshot({ snapshot, assets, }: FromSliceSnapshotPayload): Promise<FromSliceSnapshotResult<Markdown>>;
    toBlockSnapshot(payload: ToBlockSnapshotPayload<Markdown>): Promise<BlockSnapshot>;
    toDocSnapshot(payload: ToDocSnapshotPayload<Markdown>): Promise<DocSnapshot>;
    toSliceSnapshot(payload: MarkdownToSliceSnapshotPayload): Promise<SliceSnapshot | null>;
}
export declare const MarkdownAdapterFactoryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<import("../types").AdapterFactory>;
export declare const MarkdownAdapterFactoryExtension: ExtensionType;
export {};
//# sourceMappingURL=markdown.d.ts.map