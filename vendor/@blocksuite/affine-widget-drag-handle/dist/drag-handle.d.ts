import './components/add-block-widget.js';
import type { RootBlockModel } from '@blocksuite/affine-model';
import type { IVec, Point, Rect } from '@blocksuite/global/gfx';
import { type BlockComponent, WidgetComponent } from '@blocksuite/std';
import type { GfxModel } from '@blocksuite/std/gfx';
import { type ReadonlySignal } from '@preact/signals-core';
import type { AFFINE_DRAG_HANDLE_WIDGET } from './consts.js';
import { RectHelper } from './helpers/rect-helper.js';
import { SelectionHelper } from './helpers/selection-helper.js';
import { EdgelessWatcher } from './watchers/edgeless-watcher.js';
import { PointerEventWatcher } from './watchers/pointer-event-watcher.js';
export declare class AffineDragHandleWidget extends WidgetComponent<RootBlockModel> {
    static styles: import("lit").CSSResult;
    private _anchorModelDisposables;
    /**
     * Used to handle drag behavior
     */
    private readonly _dragEventWatcher;
    private readonly _handleEventWatcher;
    private readonly _keyboardEventWatcher;
    private readonly _pageWatcher;
    private readonly _reset;
    /**
     * Insert a new empty paragraph block below the currently hovered block
     * and move the cursor into it.
     */
    private readonly _handleAddBlock;
    accessor activeDragHandle: 'block' | 'gfx' | null;
    accessor showAddBlockWidget: boolean;
    anchorBlockId: import("@preact/signals-core").Signal<string | null>;
    anchorBlockComponent: ReadonlySignal<BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null>;
    anchorEdgelessElement: ReadonlySignal<GfxModel | null>;
    center: IVec;
    dragging: boolean;
    rectHelper: RectHelper;
    draggingAreaRect: ReadonlySignal<Rect | null>;
    lastDragPoint: Point | null;
    edgelessWatcher: EdgelessWatcher;
    handleAnchorModelDisposables: () => void;
    /**
     * @param force Reset the dragging state
     */
    hide: (force?: boolean) => void;
    isDragHandleHovered: boolean;
    get isBlockDragHandleVisible(): boolean;
    get isGfxDragHandleVisible(): boolean;
    noteScale: import("@preact/signals-core").Signal<number>;
    pointerEventWatcher: PointerEventWatcher;
    scale: import("@preact/signals-core").Signal<number>;
    scaleInNote: ReadonlySignal<number>;
    selectionHelper: SelectionHelper;
    get dragHandleContainerOffsetParent(): HTMLElement;
    get mode(): import("@blocksuite/affine-model").DocMode | null;
    get rootComponent(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor dragHandleContainer: HTMLDivElement;
    accessor dragHandleGrabber: HTMLDivElement;
    accessor addBlockWidgetContainer: HTMLDivElement;
    accessor dragHoverRect: {
        width: number;
        height: number;
        left: number;
        top: number;
    } | null;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_DRAG_HANDLE_WIDGET]: AffineDragHandleWidget;
    }
}
//# sourceMappingURL=drag-handle.d.ts.map