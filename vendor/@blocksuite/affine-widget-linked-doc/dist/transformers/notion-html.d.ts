import { type ExtensionType, type Schema, type Workspace } from '@blocksuite/store';
import { type ImportBatch } from './import-batch.js';
type ImportNotionZipOptions = {
    collection: Workspace;
    schema: Schema;
    imported: Blob;
    extensions: ExtensionType[];
};
export type PageIcon = {
    type: 'emoji' | 'image';
    content: string;
};
export type FolderHierarchy = {
    name: string;
    path: string;
    children: Map<string, FolderHierarchy>;
    pageId?: string;
    parentPath?: string;
    icon?: PageIcon;
};
export type PlanNotionHtmlZipResult = {
    entryId: string | undefined;
    pageIds: string[];
    isWorkspaceFile: boolean;
    hasMarkdown: boolean;
    folderHierarchy?: FolderHierarchy;
    batch: ImportBatch;
};
declare function planNotionHtmlZip({ collection, schema, imported, extensions, }: ImportNotionZipOptions): Promise<PlanNotionHtmlZipResult>;
export declare const NotionHtmlTransformer: {
    planNotionHtmlZip: typeof planNotionHtmlZip;
};
export {};
//# sourceMappingURL=notion-html.d.ts.map