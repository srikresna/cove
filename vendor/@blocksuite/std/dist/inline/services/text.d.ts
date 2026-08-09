import type { BaseTextAttributes, DeltaInsert } from '@blocksuite/store';
import type { InlineEditor } from '../inline-editor.js';
import type { InlineRange } from '../types.js';
export declare class InlineTextService<TextAttributes extends BaseTextAttributes> {
    readonly editor: InlineEditor<TextAttributes>;
    deleteText: (inlineRange: InlineRange) => void;
    formatText: (inlineRange: InlineRange, attributes: TextAttributes, options?: {
        match?: (delta: DeltaInsert, deltaInlineRange: InlineRange) => boolean;
        mode?: "replace" | "merge";
        withoutTransact?: boolean;
    }) => void;
    insertLineBreak: (inlineRange: InlineRange) => void;
    insertText: (inlineRange: InlineRange, text: string, attributes?: TextAttributes) => void;
    resetText: (inlineRange: InlineRange) => void;
    setText: (text: string, attributes?: TextAttributes) => void;
    readonly transact: (fn: () => void, withoutTransact?: boolean) => void;
    get yText(): import("yjs").Text;
    constructor(editor: InlineEditor<TextAttributes>);
}
//# sourceMappingURL=text.d.ts.map