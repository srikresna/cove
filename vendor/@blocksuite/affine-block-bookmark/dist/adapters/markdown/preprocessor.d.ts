import { type MarkdownAdapterPreprocessor } from '@blocksuite/affine-shared/adapters';
/**
 * Preprocessor for footnote url
 * We should encode url in footnote definition to avoid markdown link parsing
 *
 * Example of footnote definition:
 * [^ref]: {"type":"url","url":"https://example.com"}
 */
export declare function footnoteUrlPreprocessor(content: string): string;
export declare const BookmarkBlockMarkdownPreprocessorExtension: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<MarkdownAdapterPreprocessor>;
};
//# sourceMappingURL=preprocessor.d.ts.map