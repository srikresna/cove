import type { MarkdownAST } from '@blocksuite/affine-shared/adapters';
import { ElementModelAdapter, type ElementModelAdapterContext } from '../../type.js';
import type { ElementToMarkdownAdapterMatcher } from './type.js';
export declare class MarkdownElementModelAdapter extends ElementModelAdapter<MarkdownAST, MarkdownAST> {
    readonly elementModelMatchers: ElementToMarkdownAdapterMatcher[];
    constructor(elementModelMatchers: ElementToMarkdownAdapterMatcher[]);
    fromElementModel(element: Record<string, unknown>, context: ElementModelAdapterContext<MarkdownAST>): MarkdownAST | null;
}
export * from './type.js';
//# sourceMappingURL=index.d.ts.map