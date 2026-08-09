import { type VirtualKeyboardProviderWithAction } from '@blocksuite/affine-shared/services';
import { BlockComponent, ShadowlessElement } from '@blocksuite/std';
import type { KeyboardToolbarConfig } from './config';
export declare const AFFINE_KEYBOARD_TOOLBAR = "affine-keyboard-toolbar";
declare const AffineKeyboardToolbar_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineKeyboardToolbar extends AffineKeyboardToolbar_base {
    static styles: import("lit").CSSResult;
    get std(): import("@blocksuite/std").BlockStdScope;
    get panelOpened(): boolean;
    private get panelHeight();
    /**
     * Prevent flickering during keyboard opening
     */
    private _resetPanelIndexTimeoutId;
    private readonly _closeToolPanel;
    private readonly _currentPanelIndex$;
    private readonly _goPrevToolbar;
    private readonly _handleItemClick;
    private readonly _lastActiveItem$;
    private readonly _path$;
    private readonly _scrollCurrentBlockIntoView;
    private get _context();
    private get _currentPanelConfig();
    private get _currentToolbarItems();
    private get _isSubToolbarOpened();
    private _renderIcon;
    private _renderItem;
    private _renderItems;
    private _renderKeyboardButton;
    connectedCallback(): void;
    private _watchAutoShow;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor keyboard: VirtualKeyboardProviderWithAction;
    accessor config: KeyboardToolbarConfig;
    accessor rootComponent: BlockComponent;
}
export {};
//# sourceMappingURL=keyboard-toolbar.d.ts.map