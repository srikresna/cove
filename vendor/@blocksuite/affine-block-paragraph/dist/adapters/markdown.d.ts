import { type BlockMarkdownAdapterMatcher } from '@blocksuite/affine-shared/adapters';
/**
 * Extend the HeadingData type to include the collapsed property
 */
declare module 'mdast' {
    interface HeadingData {
        collapsed?: boolean;
    }
}
export declare const paragraphBlockMarkdownAdapterMatcher: BlockMarkdownAdapterMatcher;
export declare const ParagraphBlockMarkdownAdapterExtension: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<BlockMarkdownAdapterMatcher>;
};
//# sourceMappingURL=markdown.d.ts.map