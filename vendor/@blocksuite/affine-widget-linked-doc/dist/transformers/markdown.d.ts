import type { DocMeta, ExtensionType, Schema, Store, Workspace } from '@blocksuite/store';
import { Transformer } from '@blocksuite/store';
import { type ImportBatch } from './import-batch.js';
import type { AssetMap, PathBlobIdMap } from './type.js';
export type ParsedFrontmatterMeta = Partial<Pick<DocMeta, 'title' | 'createDate' | 'updatedDate' | 'tags' | 'favorite' | 'trash'>>;
export declare function parseFrontmatter(markdown: string): {
    content: string;
    meta: ParsedFrontmatterMeta;
};
export declare function applyMetaPatch(collection: Workspace, docId: string, meta: ParsedFrontmatterMeta): void;
export declare function getProvider(extensions: ExtensionType[]): import("@blocksuite/global/di").ServiceProvider;
type ImportMarkdownToBlockOptions = {
    doc: Store;
    markdown: string;
    blockId: string;
    extensions: ExtensionType[];
};
type ImportMarkdownToDocOptions = {
    collection: Workspace;
    schema: Schema;
    markdown: string;
    fileName?: string;
    extensions: ExtensionType[];
};
type ImportMarkdownZipOptions = {
    collection: Workspace;
    schema: Schema;
    imported: Blob;
    extensions: ExtensionType[];
};
/**
 * Filters hidden/system entries that should never participate in imports.
 */
export declare function isSystemImportPath(path: string): boolean;
/**
 * Creates the doc CRUD bridge used by importer transformers.
 */
export declare function createCollectionDocCRUD(collection: Workspace): {
    create: (id: string) => Store;
    get: (id: string) => Store | null;
    delete: (id: string) => void;
};
type CreateMarkdownImportJobOptions = {
    collection: Workspace;
    schema: Schema;
    preferredTitle?: string;
    fullPath?: string;
};
/**
 * Creates a markdown import job with the standard collection middlewares.
 */
export declare function createMarkdownImportJob({ collection, schema, preferredTitle, fullPath, }: CreateMarkdownImportJobOptions): Transformer;
type StageImportedAssetOptions = {
    pendingAssets: AssetMap;
    pendingPathBlobIdMap: PathBlobIdMap;
    path: string;
    content: Blob;
    fileName: string;
};
/**
 * Hashes a non-markdown import file and stages it into the shared asset maps.
 */
export declare function stageImportedAsset({ pendingAssets, pendingPathBlobIdMap, path, content, fileName, }: StageImportedAssetOptions): Promise<void>;
/**
 * Binds previously staged asset files into a transformer job before import.
 */
export declare function bindImportedAssetsToJob(job: Transformer, pendingAssets: AssetMap, pendingPathBlobIdMap: PathBlobIdMap): Map<string, string>;
/**
 * Exports a doc to a Markdown file or a zip archive containing Markdown and assets.
 * @param doc The doc to export
 * @returns A Promise that resolves when the export is complete
 */
declare function exportDoc(doc: Store): Promise<void>;
/**
 * Imports Markdown content into a specific block within a doc.
 * @param options Object containing import options
 * @param options.doc The target doc
 * @param options.markdown The Markdown content to import
 * @param options.blockId The ID of the block where the content will be imported
 * @returns A Promise that resolves when the import is complete
 */
declare function importMarkdownToBlock({ doc, markdown, blockId, extensions, }: ImportMarkdownToBlockOptions): Promise<void>;
/**
 * Imports Markdown content into a new doc within a collection.
 * @param options Object containing import options
 * @param options.collection The target doc collection
 * @param options.schema The schema of the target doc collection
 * @param options.markdown The Markdown content to import
 * @param options.fileName Optional filename for the imported doc
 * @returns A Promise that resolves to the ID of the newly created doc, or undefined if import fails
 */
declare function importMarkdownToDoc({ collection, schema, markdown, fileName, extensions, }: ImportMarkdownToDocOptions): Promise<string | undefined>;
/**
 * Imports a zip file containing Markdown files and assets into a collection.
 * @param options Object containing import options
 * @param options.collection The target doc collection
 * @param options.schema The schema of the target doc collection
 * @param options.imported The zip file as a Blob
 * @returns A Promise that resolves to an array of IDs of the newly created docs
 */
export type FolderHierarchy = {
    name: string;
    path: string;
    children: Map<string, FolderHierarchy>;
    pageId?: string;
    parentPath?: string;
};
export type PlanMarkdownZipResult = {
    docIds: string[];
    folderHierarchy?: FolderHierarchy;
    batch: ImportBatch;
};
declare function planMarkdownZip({ collection, schema, imported, extensions, }: ImportMarkdownZipOptions): Promise<PlanMarkdownZipResult>;
declare function planNotionMarkdownZip({ collection, schema, imported, extensions, }: ImportMarkdownZipOptions): Promise<PlanMarkdownZipResult>;
export declare const MarkdownTransformer: {
    exportDoc: typeof exportDoc;
    importMarkdownToBlock: typeof importMarkdownToBlock;
    importMarkdownToDoc: typeof importMarkdownToDoc;
    planMarkdownZip: typeof planMarkdownZip;
    planNotionMarkdownZip: typeof planNotionMarkdownZip;
};
export {};
//# sourceMappingURL=markdown.d.ts.map