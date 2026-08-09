import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { DeltaInsert, ExtensionType } from '@blocksuite/store';
import type { PhrasingContent } from 'mdast';
import type { AffineTextAttributes } from '../../types/index.js';
import type { HtmlDeltaConverter } from '../html/delta-converter.js';
import { type ASTToDeltaMatcher, DeltaASTConverter, type InlineDeltaMatcher } from '../types/delta-converter.js';
import type { MarkdownAST } from './type.js';
export type InlineDeltaToMarkdownAdapterMatcher = InlineDeltaMatcher<PhrasingContent>;
export declare const InlineDeltaToMarkdownAdapterMatcherIdentifier: ServiceIdentifier<InlineDeltaToMarkdownAdapterMatcher> & (<U extends InlineDeltaToMarkdownAdapterMatcher = InlineDeltaToMarkdownAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function InlineDeltaToMarkdownAdapterExtension(matcher: InlineDeltaToMarkdownAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<InlineDeltaToMarkdownAdapterMatcher>;
};
export type MarkdownASTToDeltaMatcher = ASTToDeltaMatcher<MarkdownAST>;
export declare const MarkdownASTToDeltaMatcherIdentifier: ServiceIdentifier<MarkdownASTToDeltaMatcher> & (<U extends MarkdownASTToDeltaMatcher = MarkdownASTToDeltaMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function MarkdownASTToDeltaExtension(matcher: MarkdownASTToDeltaMatcher): ExtensionType & {
    identifier: ServiceIdentifier<MarkdownASTToDeltaMatcher>;
};
export declare class MarkdownDeltaConverter extends DeltaASTConverter<AffineTextAttributes, MarkdownAST> {
    readonly configs: Map<string, string>;
    readonly inlineDeltaMatchers: InlineDeltaToMarkdownAdapterMatcher[];
    readonly markdownASTToDeltaMatchers: MarkdownASTToDeltaMatcher[];
    readonly htmlDeltaConverter?: HtmlDeltaConverter | undefined;
    constructor(configs: Map<string, string>, inlineDeltaMatchers: InlineDeltaToMarkdownAdapterMatcher[], markdownASTToDeltaMatchers: MarkdownASTToDeltaMatcher[], htmlDeltaConverter?: HtmlDeltaConverter | undefined);
    private _convertHtmlToDelta;
    applyTextFormatting(delta: DeltaInsert<AffineTextAttributes>): PhrasingContent;
    private _mergeInlineHtml;
    private _astChildrenToDelta;
    astToDelta(ast: MarkdownAST): DeltaInsert<AffineTextAttributes>[];
    deltaToAST(deltas: DeltaInsert<AffineTextAttributes>[], depth?: number): PhrasingContent[];
}
//# sourceMappingURL=delta-converter.d.ts.map