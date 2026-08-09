import type { RootBlockModel } from '@blocksuite/affine-model';
import { WidgetComponent } from '@blocksuite/std';
import { nothing } from 'lit';
import { type Rect } from './utils';
export declare const AFFINE_PAGE_DRAGGING_AREA_WIDGET = "affine-page-dragging-area-widget";
export declare class AffinePageDraggingAreaWidget extends WidgetComponent<RootBlockModel> {
    static excludeFlavours: string[];
    private _dragging;
    private _initialContainerOffset;
    private _initialScrollOffset;
    private _lastPointerState;
    private _rafID;
    private readonly _updateDraggingArea;
    private get _allBlocksWithRect();
    private get _viewport();
    private get scrollContainer();
    private _clearRaf;
    private _selectBlocksByRect;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    accessor rect: Rect | null;
}
export declare const pageDraggingAreaWidget: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_PAGE_DRAGGING_AREA_WIDGET]: AffinePageDraggingAreaWidget;
    }
}
//# sourceMappingURL=index.d.ts.map