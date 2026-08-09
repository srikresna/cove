import type { Schema, Store, Workspace } from '@blocksuite/store';
declare function exportDocs(collection: Workspace, schema: Schema, docs: Store[]): Promise<void>;
declare function importDocs(collection: Workspace, schema: Schema, imported: Blob): Promise<(Store | undefined)[]>;
export declare const ZipTransformer: {
    exportDocs: typeof exportDocs;
    importDocs: typeof importDocs;
};
export {};
//# sourceMappingURL=zip.d.ts.map