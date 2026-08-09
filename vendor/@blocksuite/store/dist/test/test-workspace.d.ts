import { AwarenessEngine, type AwarenessSource, BlobEngine, type BlobSource, DocEngine, type DocSource } from '@blocksuite/sync';
import { Subject } from 'rxjs';
import * as Y from 'yjs';
import type { Doc, ExtensionType, Workspace, WorkspaceMeta } from '../extension/index.js';
import { type IdGenerator } from '../utils/id-generator.js';
import { AwarenessStore } from '../yjs/index.js';
import { TestDoc } from './test-doc.js';
export type DocCollectionOptions = {
    id?: string;
    idGenerator?: IdGenerator;
    docSources?: {
        main: DocSource;
        shadows?: DocSource[];
    };
    blobSources?: {
        main: BlobSource;
        shadows?: BlobSource[];
    };
    awarenessSources?: AwarenessSource[];
};
/**
 * @internal
 * Test only
 * Do not use this in production
 */
export declare class TestWorkspace implements Workspace {
    storeExtensions: ExtensionType[];
    readonly awarenessStore: AwarenessStore;
    readonly awarenessSync: AwarenessEngine;
    readonly blobSync: BlobEngine;
    readonly blockCollections: Map<string, TestDoc>;
    readonly doc: Y.Doc;
    readonly docSync: DocEngine;
    readonly id: string;
    readonly idGenerator: IdGenerator;
    meta: WorkspaceMeta;
    slots: {
        docListUpdated: Subject<void>;
    };
    get docs(): Map<string, TestDoc>;
    constructor({ id, idGenerator, awarenessSources, docSources, blobSources, }?: DocCollectionOptions);
    private _bindDocMetaEvents;
    private _hasDoc;
    /**
     * Verify that all data has been successfully saved to the primary storage.
     * Return true if the data transfer is complete and it is secure to terminate the synchronization operation.
     */
    canGracefulStop(): void;
    /**
     * By default, only an empty doc will be created.
     * If the `init` parameter is passed, a `surface`, `note`, and `paragraph` block
     * will be created in the doc simultaneously.
     */
    createDoc(docId?: string): Doc;
    dispose(): void;
    /**
     * Terminate the data sync process forcefully, which may cause data loss.
     * It is advised to invoke `canGracefulStop` before calling this method.
     */
    forceStop(): void;
    getBlockCollection(docId: string): TestDoc | null;
    getDoc(docId: string): Doc | null;
    removeDoc(docId: string): void;
    /**
     * Start the data sync process
     */
    start(): void;
    /**
     * Wait for all data has been successfully saved to the primary storage.
     */
    waitForGracefulStop(abort?: AbortSignal): Promise<void>;
    waitForSynced(): Promise<unknown>;
}
//# sourceMappingURL=test-workspace.d.ts.map