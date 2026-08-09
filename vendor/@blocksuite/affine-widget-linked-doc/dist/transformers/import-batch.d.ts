import { type DocMeta, type DocSnapshot, type Schema, type Workspace } from '@blocksuite/store';
export type ImportBlob = {
    blobId: string;
    sourcePath: string;
    fileName: string;
    mime: string;
    bytes: Uint8Array;
};
export type ImportIconData = {
    type: 'emoji';
    unicode: string;
} | {
    type: 'image';
    content: string;
};
export type ImportFolder = {
    path: string;
    name: string;
    parentPath?: string;
    pageId?: string;
    icon?: ImportIconData;
};
export type ImportDoc = {
    id: string;
    sourcePath?: string;
    snapshot: DocSnapshot;
    meta?: Partial<Pick<DocMeta, 'title' | 'createDate' | 'updatedDate' | 'tags' | 'favorite' | 'trash'>>;
};
export type ImportTag = {
    name: string;
    docIds: string[];
};
export type ImportIcon = {
    docId: string;
    icon: ImportIconData;
};
export type ImportWarning = {
    code: string;
    message: string;
    sourcePath?: string;
};
export type ImportBatch = {
    docs: ImportDoc[];
    blobs: ImportBlob[];
    folders?: ImportFolder[];
    tags?: ImportTag[];
    icons?: ImportIcon[];
    warnings?: ImportWarning[];
    progress?: {
        completed: number;
        total: number;
    };
    entryId?: string;
    isWorkspaceFile?: boolean;
    done: boolean;
};
export type ImportCommitResult = {
    docIds: string[];
    entryId?: string;
    isWorkspaceFile?: boolean;
    rootFolderId?: string;
    warnings: ImportWarning[];
};
export declare function blobsFromAssets(assets: ReadonlyMap<string, File>, pathBlobIdMap?: ReadonlyMap<string, string>): Promise<ImportBlob[]>;
export declare function commitImportBatchToWorkspace(collection: Workspace, schema: Schema, batch: ImportBatch): Promise<ImportCommitResult>;
//# sourceMappingURL=import-batch.d.ts.map