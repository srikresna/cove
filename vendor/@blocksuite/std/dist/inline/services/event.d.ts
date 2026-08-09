import type { BaseTextAttributes } from '@blocksuite/store';
import type { InlineEditor } from '../inline-editor.js';
export declare class EventService<TextAttributes extends BaseTextAttributes> {
    readonly editor: InlineEditor<TextAttributes>;
    private _compositionInlineRange;
    private _isComposing;
    private readonly _getClosestInlineRoot;
    private readonly _isRangeCompletelyInRoot;
    private readonly _onBeforeInput;
    private readonly _onClick;
    private readonly _onCompositionEnd;
    private readonly _onCompositionStart;
    private readonly _onCompositionUpdate;
    private readonly _onKeyDown;
    private readonly _onSelectionChange;
    mount: () => void;
    get isComposing(): boolean;
    constructor(editor: InlineEditor<TextAttributes>);
}
//# sourceMappingURL=event.d.ts.map