import type { ExtensionType, Schema, Workspace } from '@blocksuite/store';
type ImportDocxOptions = {
    collection: Workspace;
    schema: Schema;
    imported: Blob;
    extensions: ExtensionType[];
};
/**
 * Imports a .docx file into a doc.
 *
 * @param options - The import options.
 * @param options.collection - The target doc collection.
 * @param options.schema - The schema of the target doc collection.
 * @param options.imported - The .docx file as a Blob.
 * @returns A Promise that resolves to the ID of the newly created doc, or undefined if import fails.
 */
declare function importDocx({ collection, schema, imported, extensions, }: ImportDocxOptions): Promise<string | undefined>;
export declare const DocxTransformer: {
    importDocx: typeof importDocx;
};
export {};
//# sourceMappingURL=docx.d.ts.map