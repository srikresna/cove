import { ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
import type { KeyboardToolbarContext, KeyboardToolPanelConfig } from './config.js';
export declare const AFFINE_KEYBOARD_TOOL_PANEL = "affine-keyboard-tool-panel";
declare const AffineKeyboardToolPanel_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineKeyboardToolPanel extends AffineKeyboardToolPanel_base {
    static styles: import("lit").CSSResult;
    private readonly _handleItemClick;
    private _renderGroup;
    private _renderIcon;
    private _renderItem;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor config: KeyboardToolPanelConfig | null;
    accessor context: KeyboardToolbarContext;
}
export {};
//# sourceMappingURL=keyboard-tool-panel.d.ts.map