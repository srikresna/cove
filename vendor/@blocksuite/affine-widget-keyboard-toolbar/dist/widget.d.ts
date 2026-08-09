import type { RootBlockModel } from '@blocksuite/affine-model';
import { type VirtualKeyboardProviderWithAction } from '@blocksuite/affine-shared/services';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const AFFINE_KEYBOARD_TOOLBAR_WIDGET = "affine-keyboard-toolbar-widget";
export declare class AffineKeyboardToolbarWidget extends WidgetComponent<RootBlockModel> {
    private readonly _show$;
    private _initialInputMode;
    get keyboard(): VirtualKeyboardProviderWithAction & {
        fallback?: boolean;
    };
    private get _docTitle();
    get config(): {
        items: import("./config.js").KeyboardToolbarItem[];
    };
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
}
export declare const keyboardToolbarWidget: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_KEYBOARD_TOOLBAR_WIDGET]: AffineKeyboardToolbarWidget;
    }
}
//# sourceMappingURL=widget.d.ts.map