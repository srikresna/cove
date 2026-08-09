import type { ExtensionType, Schema, Workspace } from '@blocksuite/store';
import { type ImportBatch } from './import-batch.js';
export declare const obsidianAttachmentEmbedMarkdownAdapterMatcher: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/adapters").BlockMarkdownAdapterMatcher>;
};
export declare const obsidianWikilinkToDeltaMatcher: ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<import("@blocksuite/affine-shared/adapters").MarkdownASTToDeltaMatcher>;
};
export type ImportObsidianVaultOptions = {
    collection: Workspace;
    schema: Schema;
    importedFiles: File[];
    extensions: ExtensionType[];
};
export type ImportObsidianVaultResult = {
    docIds: string[];
    docEmojis: Map<string, string>;
};
export type PlanObsidianVaultResult = ImportObsidianVaultResult & {
    batch: ImportBatch;
};
export declare function planObsidianVault({ collection, schema, importedFiles, extensions, }: ImportObsidianVaultOptions): Promise<PlanObsidianVaultResult>;
export declare const ObsidianTransformer: {
    planObsidianVault: typeof planObsidianVault;
};
//# sourceMappingURL=obsidian.d.ts.map