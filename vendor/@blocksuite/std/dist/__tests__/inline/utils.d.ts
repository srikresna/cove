import type { DeltaInsert } from '@blocksuite/store';
import { type Page } from '@playwright/test';
import type { InlineRange } from '../../inline/index.js';
export declare function type(page: Page, content: string): Promise<void>;
export declare function press(page: Page, content: string): Promise<void>;
export declare function enterInlineEditorPlayground(page: Page): Promise<void>;
export declare function focusInlineRichText(page: Page, index?: number): Promise<void>;
export declare function getDeltaFromInlineRichText(page: Page, index?: number): Promise<DeltaInsert>;
export declare function getInlineRangeFromInlineRichText(page: Page, index?: number): Promise<InlineRange | null>;
export declare function setInlineRichTextRange(page: Page, inlineRange: InlineRange, index?: number): Promise<void>;
export declare function getInlineRichTextLine(page: Page, index: number, i?: number): Promise<readonly [string, number]>;
export declare function getInlineRangeIndexRect(page: Page, [richTextIndex, inlineIndex]: [number, number], coordOffSet?: {
    x: number;
    y: number;
}): Promise<{
    x: any;
    y: any;
}>;
export declare function assertSelection(page: Page, richTextIndex: number, rangeIndex: number, rangeLength?: number): Promise<void>;
//# sourceMappingURL=utils.d.ts.map