import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { DeltaInsert, ExtensionType } from '@blocksuite/store';
import type { AffineTextAttributes } from '../../types/index.js';
import { type ASTToDeltaMatcher, DeltaASTConverter, type DeltaASTConverterOptions, type InlineDeltaMatcher } from '../types/delta-converter.js';
import type { HtmlAST, InlineHtmlAST } from '../types/hast.js';
export type InlineDeltaToNotionHtmlAdapterMatcher = InlineDeltaMatcher<InlineHtmlAST>;
export type NotionHtmlASTToDeltaMatcher = ASTToDeltaMatcher<HtmlAST>;
export declare const NotionHtmlASTToDeltaMatcherIdentifier: ServiceIdentifier<NotionHtmlASTToDeltaMatcher> & (<U extends NotionHtmlASTToDeltaMatcher = NotionHtmlASTToDeltaMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function NotionHtmlASTToDeltaExtension(matcher: NotionHtmlASTToDeltaMatcher): ExtensionType & {
    identifier: ServiceIdentifier<NotionHtmlASTToDeltaMatcher>;
};
export declare class NotionHtmlDeltaConverter extends DeltaASTConverter<AffineTextAttributes, HtmlAST> {
    readonly configs: Map<string, string>;
    readonly inlineDeltaMatchers: InlineDeltaToNotionHtmlAdapterMatcher[];
    readonly htmlASTToDeltaMatchers: NotionHtmlASTToDeltaMatcher[];
    constructor(configs: Map<string, string>, inlineDeltaMatchers: InlineDeltaToNotionHtmlAdapterMatcher[], htmlASTToDeltaMatchers: NotionHtmlASTToDeltaMatcher[]);
    private _spreadAstToDelta;
    astToDelta(ast: HtmlAST, options?: DeltaASTConverterOptions): DeltaInsert<AffineTextAttributes>[];
    deltaToAST(_: DeltaInsert<AffineTextAttributes>[]): InlineHtmlAST[];
}
//# sourceMappingURL=delta-converter.d.ts.map