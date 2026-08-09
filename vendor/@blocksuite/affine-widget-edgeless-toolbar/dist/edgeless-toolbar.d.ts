import { type RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
import { type EdgelessToolbarSlots } from './context.js';
import type { MenuPopper } from './create-popper.js';
export declare const EDGELESS_TOOLBAR_WIDGET = "edgeless-toolbar-widget";
export declare class EdgelessToolbarWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private readonly _appTheme$;
    private _moreQuickToolsMenu;
    private _moreQuickToolsMenuRef;
    accessor containerWidth: number;
    private readonly _onContainerResize;
    private _resizeObserver;
    private readonly _slotsProvider;
    private readonly _themeProvider;
    private readonly _toolbarProvider;
    activePopper: MenuPopper<HTMLElement> | null;
    private get _availableWidth();
    private get _cachedPresentHideToolbar();
    private get _denseQuickTools();
    private get _denseSeniorTools();
    /**
     * When enabled, the toolbar will auto-hide when the mouse is not over it.
     */
    private get _enableAutoHide();
    private get _hiddenQuickTools();
    private get _quickTools();
    private get _quickToolsWidthTotal();
    private get _seniorNextTooltip();
    private get _seniorPrevTooltip();
    private get _seniorScrollNextDisabled();
    private get _seniorScrollPrevDisabled();
    private get _seniorToolNavWidth();
    private get _seniorTools();
    private get _seniorToolsWidthTotal();
    private get _spaceWidthTotal();
    private get _visibleQuickToolSize();
    get edgelessTool(): string;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get isPresentMode(): boolean;
    get scrollSeniorToolSize(): number;
    get slots(): EdgelessToolbarSlots;
    constructor();
    private _onSeniorNavNext;
    private _onSeniorNavPrev;
    private _openMoreQuickToolsMenu;
    private _renderContent;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    accessor presentFrameMenuShow: boolean;
    accessor presentSettingMenuShow: boolean;
    accessor scrollSeniorToolIndex: number;
    accessor toolbarContainer: HTMLElement;
}
export declare const edgelessToolbarWidget: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=edgeless-toolbar.d.ts.map