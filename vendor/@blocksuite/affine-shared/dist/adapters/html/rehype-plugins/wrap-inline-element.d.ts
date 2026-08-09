import type { Root } from 'hast';
import type { Plugin } from 'unified';
/**
 * In some cases, the inline elements are wrapped in a div tag mixed with block elements
 * We need to wrap them in a p tag to avoid the inline elements being treated as a block element
 */
export declare const rehypeWrapInlineElements: Plugin<[], Root>;
//# sourceMappingURL=wrap-inline-element.d.ts.map