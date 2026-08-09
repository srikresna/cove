import { type MarkdownAdapterPreprocessor } from '@blocksuite/affine-shared/adapters';
/**
 * Preprocess footnote references to avoid markdown link parsing
 * Only add space when footnote reference follows a URL
 * @param content
 * @returns
 * @example
 * ```md
 * https://example.com[^label] -> https://example.com [^label]
 * normal text[^label] -> normal text[^label]
 * ```
 */
export declare function preprocessFootnoteReference(content: string): string;
export declare const FootnoteReferenceMarkdownPreprocessorExtension: import("@blocksuite/store").ExtensionType & {
    identifier: import("@blocksuite/global/di").ServiceIdentifier<MarkdownAdapterPreprocessor>;
};
//# sourceMappingURL=preprocessor.d.ts.map