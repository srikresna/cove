import { type ServiceIdentifier, type ServiceProvider } from '@blocksuite/global/di';
import type { DeltaInsert, ExtensionType } from '@blocksuite/store';
import type { AffineTextAttributes } from '../../types/index.js';
import { type ASTToDeltaMatcher, DeltaASTConverter, type DeltaASTConverterOptions, type InlineDeltaMatcher } from '../types/delta-converter.js';
import type { HtmlAST, InlineHtmlAST } from '../types/hast.js';
export type InlineDeltaToHtmlAdapterMatcher = InlineDeltaMatcher<InlineHtmlAST>;
export declare const InlineDeltaToHtmlAdapterMatcherIdentifier: ServiceIdentifier<InlineDeltaToHtmlAdapterMatcher> & (<U extends InlineDeltaToHtmlAdapterMatcher = InlineDeltaToHtmlAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function InlineDeltaToHtmlAdapterExtension(matcher: InlineDeltaToHtmlAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<InlineDeltaToHtmlAdapterMatcher>;
};
export type HtmlASTToDeltaMatcher = ASTToDeltaMatcher<HtmlAST>;
export declare const HtmlASTToDeltaMatcherIdentifier: ServiceIdentifier<HtmlASTToDeltaMatcher> & (<U extends HtmlASTToDeltaMatcher = HtmlASTToDeltaMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function HtmlASTToDeltaExtension(matcher: HtmlASTToDeltaMatcher): ExtensionType & {
    identifier: ServiceIdentifier<HtmlASTToDeltaMatcher>;
};
export declare class HtmlDeltaConverter extends DeltaASTConverter<AffineTextAttributes, HtmlAST> {
    readonly configs: Map<string, string>;
    readonly inlineDeltaMatchers: InlineDeltaToHtmlAdapterMatcher[];
    readonly htmlASTToDeltaMatchers: HtmlASTToDeltaMatcher[];
    readonly provider: ServiceProvider;
    constructor(configs: Map<string, string>, inlineDeltaMatchers: InlineDeltaToHtmlAdapterMatcher[], htmlASTToDeltaMatchers: HtmlASTToDeltaMatcher[], provider: ServiceProvider);
    private _applyTextFormatting;
    private _spreadAstToDelta;
    astToDelta(ast: HtmlAST, options?: DeltaASTConverterOptions): DeltaInsert<AffineTextAttributes>[];
    deltaToAST(deltas: DeltaInsert<AffineTextAttributes>[], depth?: number): InlineHtmlAST[];
}
//# sourceMappingURL=delta-converter.d.ts.map