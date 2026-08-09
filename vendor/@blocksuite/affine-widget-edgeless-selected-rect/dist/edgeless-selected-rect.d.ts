import { type FrameOverlay } from '@blocksuite/affine-block-frame';
import { type RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const EDGELESS_SELECTED_RECT_WIDGET = "edgeless-selected-rect";
export declare class EdgelessSelectedRectWidget extends WidgetComponent<RootBlockModel> {
    static enabledWarnings: never[];
    static styles: import("lit").CSSResult;
    private readonly _dragEndCleanup;
    private readonly _updateCursor;
    private readonly _updateOnElementChange;
    private readonly _updateHandles;
    private readonly _updateOnSelectionChange;
    private accessor _selectedRect;
    private readonly _updateSelectedRect;
    get frameOverlay(): FrameOverlay;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get surface(): import("@blocksuite/std/gfx").SurfaceBlockModel | null;
    get zoom(): number;
    constructor();
    private _shouldRenderSelection;
    firstUpdated(): void;
    private get _interaction();
    private get _slots();
    private _renderHandles;
    private _renderAutoComplete;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private accessor _allowedHandles;
    private accessor _isHeightLimit;
    private accessor _isResizing;
    private accessor _isWidthLimit;
    private accessor _mode;
    private accessor _scaleDirection;
    private accessor _scalePercent;
    accessor autoCompleteOff: boolean;
}
//# sourceMappingURL=edgeless-selected-rect.d.ts.map