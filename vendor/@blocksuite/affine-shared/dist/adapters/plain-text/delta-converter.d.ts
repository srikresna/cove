import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { DeltaInsert, ExtensionType } from '@blocksuite/store';
import type { AffineTextAttributes } from '../../types/index.js';
import type { TextBuffer } from '../types/adapter.js';
import { type ASTToDeltaMatcher, DeltaASTConverter, type InlineDeltaMatcher } from '../types/delta-converter.js';
export type InlineDeltaToPlainTextAdapterMatcher = InlineDeltaMatcher<TextBuffer>;
export declare const InlineDeltaToPlainTextAdapterMatcherIdentifier: ServiceIdentifier<InlineDeltaToPlainTextAdapterMatcher> & (<U extends InlineDeltaToPlainTextAdapterMatcher = InlineDeltaToPlainTextAdapterMatcher>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function InlineDeltaToPlainTextAdapterExtension(matcher: InlineDeltaToPlainTextAdapterMatcher): ExtensionType & {
    identifier: ServiceIdentifier<InlineDeltaToPlainTextAdapterMatcher>;
};
export type PlainTextASTToDeltaMatcher = ASTToDeltaMatcher<string>;
export declare class PlainTextDeltaConverter extends DeltaASTConverter<AffineTextAttributes, string> {
    readonly configs: Map<string, string>;
    readonly inlineDeltaMatchers: InlineDeltaToPlainTextAdapterMatcher[];
    readonly plainTextASTToDeltaMatchers: PlainTextASTToDeltaMatcher[];
    constructor(configs: Map<string, string>, inlineDeltaMatchers: InlineDeltaToPlainTextAdapterMatcher[], plainTextASTToDeltaMatchers: PlainTextASTToDeltaMatcher[]);
    astToDelta(ast: string): DeltaInsert<AffineTextAttributes>[];
    deltaToAST(deltas: DeltaInsert<AffineTextAttributes>[]): string[];
}
//# sourceMappingURL=delta-converter.d.ts.map