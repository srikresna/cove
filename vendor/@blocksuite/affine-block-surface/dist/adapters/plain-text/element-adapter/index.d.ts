import type { TextBuffer } from '@blocksuite/affine-shared/adapters';
import { ElementModelAdapter, type ElementModelAdapterContext } from '../../type.js';
import type { ElementToPlainTextAdapterMatcher } from './type.js';
export declare class PlainTextElementModelAdapter extends ElementModelAdapter<string, TextBuffer> {
    readonly elementModelMatchers: ElementToPlainTextAdapterMatcher[];
    constructor(elementModelMatchers: ElementToPlainTextAdapterMatcher[]);
    fromElementModel(element: Record<string, unknown>, context: ElementModelAdapterContext<TextBuffer>): string;
}
export * from './type.js';
//# sourceMappingURL=index.d.ts.map