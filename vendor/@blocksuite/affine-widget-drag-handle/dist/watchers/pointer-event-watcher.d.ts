import type { AffineDragHandleWidget } from '../drag-handle.js';
/**
 * Used to control the drag handle visibility in page mode
 */
export declare class PointerEventWatcher {
    readonly widget: AffineDragHandleWidget;
    private _isPointerDown;
    private get _gfx();
    private readonly _canEditing;
    /**
     * When click on drag handle
     * Should select the block and show slash menu if current block is not selected
     * Should clear selection if current block is the first selected block
     */
    private readonly _clickHandler;
    private readonly _getTopWithBlockComponent;
    private readonly _containerStyle;
    private readonly _grabberStyle;
    private _lastHoveredBlockId;
    private _lastShowedBlock;
    private _lastPointerHitBlockId;
    private _lastPointerHitBlockElement;
    /**
     * When pointer move on block, should show drag handle
     * And update hover block id and path
     */
    private readonly _pointerMoveOnBlock;
    private readonly _pointerOutHandler;
    private readonly _throttledPointerMoveHandler;
    showDragHandleOnHoverBlock: () => void;
    private readonly _pointerDownHandler;
    private readonly _pointerUpHandler;
    constructor(widget: AffineDragHandleWidget);
    reset(): void;
    watch(): void;
}
//# sourceMappingURL=pointer-event-watcher.d.ts.map