import type { AffineInlineEditor } from '@blocksuite/affine-shared/types';
import { type UrlTextSegment } from '@blocksuite/affine-shared/utils';
import type { InlineRange } from '@blocksuite/std/inline';
type UrlPasteInlineEditor = Pick<AffineInlineEditor, 'insertText' | 'setInlineRange'>;
export declare function analyzeTextForUrlPaste(text: string): {
    segments: UrlTextSegment[];
    singleUrl: string | undefined;
};
export declare function insertUrlTextSegments(inlineEditor: UrlPasteInlineEditor, inlineRange: InlineRange, segments: UrlTextSegment[]): void;
export {};
//# sourceMappingURL=paste-url.d.ts.map