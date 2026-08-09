import * as Y from 'yjs';
import type { Doc, GetStoreOptions, Workspace } from '../extension/index.js';
import type { YBlock } from '../model/block/types.js';
import type { AwarenessStore } from '../yjs/index.js';
type DocOptions = {
    id: string;
    collection: Workspace;
    doc: Y.Doc;
    awarenessStore: AwarenessStore;
};
export declare class TestDoc implements Doc {
    private readonly _collection;
    private readonly _storeContainer;
    private readonly _initSubDoc;
    private _loaded;
    private readonly _onSubdocEvent;
    /** Indicate whether the block tree is ready */
    private _ready;
    protected readonly _yBlocks: Y.Map<YBlock>;
    /**
     * @internal Used for convenient access to the underlying Yjs map,
     * can be used interchangeably with ySpace
     */
    protected readonly _ySpaceDoc: Y.Doc;
    readonly awarenessStore: AwarenessStore;
    readonly id: string;
    readonly rootDoc: Y.Doc;
    get blobSync(): import("@blocksuite/sync").BlobEngine;
    get workspace(): Workspace;
    get isEmpty(): boolean;
    get loaded(): boolean;
    get meta(): import("../index.js").DocMeta | undefined;
    get ready(): boolean;
    get spaceDoc(): Y.Doc;
    get yBlocks(): Y.Map<YBlock>;
    constructor({ id, collection, doc, awarenessStore }: DocOptions);
    clear(): void;
    get removeStore(): ({ readonly, query, id }: import("../index.js").RemoveStoreOptions) => void;
    private _destroy;
    dispose(): void;
    getStore({ readonly, query, provider, extensions, id, }?: GetStoreOptions): import("../index.js").Store;
    load(initFn?: () => void): this;
    remove(): void;
}
export {};
//# sourceMappingURL=test-doc.d.ts.map