import type { ExtensionType, Schema, Store, Workspace } from '@blocksuite/store';
type ImportHTMLToDocOptions = {
    collection: Workspace;
    schema: Schema;
    html: string;
    fileName?: string;
    extensions: ExtensionType[];
};
type ImportHTMLZipOptions = {
    collection: Workspace;
    schema: Schema;
    imported: Blob;
    extensions: ExtensionType[];
};
/**
 * Exports a doc to HTML format.
 *
 * @param doc - The doc to be exported.
 * @returns A Promise that resolves when the export is complete.
 */
declare function exportDoc(doc: Store): Promise<void>;
/**
 * Imports HTML content into a new doc within a collection.
 *
 * @param options - The import options.
 * @param options.collection - The target doc collection.
 * @param options.schema - The schema of the target doc collection.
 * @param options.html - The HTML content to import.
 * @param options.fileName - Optional filename for the imported doc.
 * @returns A Promise that resolves to the ID of the newly created doc, or undefined if import fails.
 */
declare function importHTMLToDoc({ collection, schema, html, fileName, extensions, }: ImportHTMLToDocOptions): Promise<string | undefined>;
/**
 * Imports a zip file containing HTML files and assets into a collection.
 *
 * @param options - The import options.
 * @param options.collection - The target doc collection.
 * @param options.schema - The schema of the target doc collection.
 * @param options.imported - The zip file as a Blob.
 * @returns A Promise that resolves to an array of IDs of the newly created docs.
 */
declare function importHTMLZip({ collection, schema, imported, extensions, }: ImportHTMLZipOptions): Promise<string[]>;
export declare const HtmlTransformer: {
    exportDoc: typeof exportDoc;
    importHTMLToDoc: typeof importHTMLToDoc;
    importHTMLZip: typeof importHTMLZip;
};
export {};
//# sourceMappingURL=html.d.ts.map