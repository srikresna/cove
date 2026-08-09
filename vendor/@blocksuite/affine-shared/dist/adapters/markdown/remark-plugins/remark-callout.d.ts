import type { Root } from 'mdast';
import type { Plugin } from 'unified';
export declare const remarkCallout: Plugin<[], Root>;
/**
 * Extend the BlockquoteData interface to include isCallout and calloutEmoji properties
 */
declare module 'mdast' {
    interface BlockquoteData {
        isCallout?: boolean;
        calloutEmoji?: string;
    }
}
//# sourceMappingURL=remark-callout.d.ts.map