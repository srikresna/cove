import { type BlockStdScope } from '@blocksuite/std';
import type { InlineEditor, InlineRange } from '@blocksuite/std/inline';
import { BlockModel } from '@blocksuite/store';
import type { RichText } from './rich-text.js';
/**
 * In most cases, you not need RichText, you can use {@link getInlineEditorByModel} instead.
 */
export declare function getRichTextByModel(std: BlockStdScope, id: string): RichText | null;
export declare function asyncGetRichText(std: BlockStdScope, id: string): Promise<RichText | null>;
export declare function getInlineEditorByModel(std: BlockStdScope, model: BlockModel | string): import("@blocksuite/affine-shared/types").AffineInlineEditor | null;
export declare function asyncSetInlineRange(std: BlockStdScope, model: BlockModel, inlineRange: InlineRange): Promise<void>;
export declare function focusTextModel(std: BlockStdScope, id: string, offset?: number): void;
export declare function selectTextModel(std: BlockStdScope, id: string, index?: number, length?: number): void;
export declare function onModelTextUpdated(std: BlockStdScope, model: BlockModel, callback?: (text: RichText) => void): Promise<void>;
/**
 * Remove specified text from the current range.
 */
export declare function cleanSpecifiedTail(std: BlockStdScope, inlineEditorOrModel: InlineEditor | BlockModel, str: string): void;
export declare function getTextContentFromInlineRange(inlineEditor: InlineEditor, startRange: InlineRange | null): string | null;
//# sourceMappingURL=dom.d.ts.map