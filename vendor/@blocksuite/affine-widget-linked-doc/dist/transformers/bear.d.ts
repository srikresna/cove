import type { ExtensionType, Schema, Workspace } from '@blocksuite/store';
import { type ImportBatch } from './import-batch.js';
/** Recursive tree node representing a tag-based folder hierarchy. */
export type BearFolderHierarchy = {
    name: string;
    path: string;
    children: Map<string, BearFolderHierarchy>;
    pageId?: string;
    parentPath?: string;
};
type BearImportOptions = {
    collection: Workspace;
    schema: Schema;
    imported: Blob;
    extensions: ExtensionType[];
};
export type PlanBearBackupResult = {
    docIds: string[];
    tags: Map<string, string[]>;
    folderHierarchy: BearFolderHierarchy;
    batch: ImportBatch;
};
/**
 * Import a Bear .bear2bk backup file.
 * Uses JSZip for lazy/streaming decompression to handle large backups.
 */
declare function planBearBackup({ collection, schema, imported, extensions, }: BearImportOptions): Promise<PlanBearBackupResult>;
/** Public API for importing Bear .bear2bk backup archives. */
export declare const BearTransformer: {
    planBearBackup: typeof planBearBackup;
};
export {};
//# sourceMappingURL=bear.d.ts.map