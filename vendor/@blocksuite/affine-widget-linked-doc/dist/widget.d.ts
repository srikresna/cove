import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { type InlineEditor } from '@blocksuite/std/inline';
import { nothing } from 'lit';
import { AFFINE_LINKED_DOC_WIDGET, type LinkedWidgetConfig } from './config.js';
export declare class AffineLinkedDocWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private _context;
    private readonly _inputRects$;
    private readonly _mode$;
    private _addTriggerKey;
    private _updateInputRects;
    private get _isCursorAtEnd();
    private readonly _renderLinkedDocMenu;
    private readonly _renderLinkedDocPopover;
    private _renderInputMask;
    private _watchInput;
    private _watchViewportChange;
    get config(): LinkedWidgetConfig;
    connectedCallback(): void;
    show(props?: {
        inlineEditor?: InlineEditor;
        primaryTriggerKey?: string;
        mode?: 'desktop' | 'mobile';
        addTriggerKey?: boolean;
    }): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
}
export declare const linkedDocWidget: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_LINKED_DOC_WIDGET]: AffineLinkedDocWidget;
    }
}
//# sourceMappingURL=widget.d.ts.map