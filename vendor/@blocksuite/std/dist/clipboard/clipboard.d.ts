import type { BlockSnapshot, Slice, Store, TransformerMiddleware } from '@blocksuite/store';
import { LifeCycleWatcher } from '../extension/index.js';
export declare class Clipboard extends LifeCycleWatcher {
    static key: string;
    protected get _adapters(): import("./clipboard-adapter.js").ClipboardAdapterConfig[];
    private readonly _getDataByType;
    private readonly _getSnapshotByPriority;
    private _jobMiddlewares;
    copy: (slice: Slice) => Promise<void>;
    copySlice: (slice: Slice) => Promise<void>;
    duplicateSlice: (slice: Slice, doc: Store, parent?: string, index?: number, type?: string) => Promise<void>;
    paste: (event: ClipboardEvent, doc: Store, parent?: string, index?: number) => Promise<Slice | null | undefined>;
    pasteBlockSnapshot: (snapshot: BlockSnapshot, doc: Store, parent?: string, index?: number) => Promise<import("@blocksuite/store").BlockModel<object> | undefined>;
    unuse: (middleware: TransformerMiddleware) => void;
    use: (middleware: TransformerMiddleware) => void;
    get configs(): Map<string, string>;
    private _getClipboardItem;
    private _getJob;
    readFromClipboard(clipboardData: DataTransfer): any;
    sliceToSnapshot(slice: Slice): import("@blocksuite/store").SliceSnapshot | undefined;
    writeToClipboard(updateItems: <T extends Record<string, unknown>>(items: T) => Promise<T> | T): Promise<void>;
}
//# sourceMappingURL=clipboard.d.ts.map