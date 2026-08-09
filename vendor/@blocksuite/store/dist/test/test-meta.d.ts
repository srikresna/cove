import { Subject } from 'rxjs';
import type * as Y from 'yjs';
import type { DocMeta, DocsPropertiesMeta, WorkspaceMeta } from '../extension/index.js';
type DocCollectionMetaState = {
    pages?: unknown[];
    properties?: DocsPropertiesMeta;
    name?: string;
    avatar?: string;
};
export declare class TestMeta implements WorkspaceMeta {
    private readonly _handleDocCollectionMetaEvents;
    private _prevDocs;
    protected readonly _proxy: DocCollectionMetaState;
    protected readonly _yMap: Y.Map<DocCollectionMetaState[keyof DocCollectionMetaState]>;
    readonly doc: Y.Doc;
    docMetaAdded: Subject<string>;
    docMetaRemoved: Subject<string>;
    docMetaUpdated: Subject<void>;
    readonly id: string;
    get docMetas(): DocMeta[];
    get docs(): unknown[] | undefined;
    get properties(): DocsPropertiesMeta;
    get yDocs(): Y.Array<unknown>;
    constructor(doc: Y.Doc);
    private _handleDocMetaEvent;
    addDocMeta(doc: DocMeta, index?: number): void;
    getDocMeta(id: string): DocMeta | undefined;
    initialize(): void;
    removeDocMeta(id: string): void;
    setDocMeta(id: string, props: Partial<DocMeta>): void;
    setProperties(meta: DocsPropertiesMeta): void;
}
export {};
//# sourceMappingURL=test-meta.d.ts.map