import { Rect } from '@blocksuite/global/gfx';
import type { AffineDragHandleWidget } from '../drag-handle.js';
type HoveredElemArea = {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    padding: number;
    containerWidth: number;
};
/**
 * Used to control the drag handle visibility in edgeless mode
 *
 * 1. Show drag handle on every block and gfx element
 * 2. Multiple selection is not supported
 */
export declare class EdgelessWatcher {
    readonly widget: AffineDragHandleWidget;
    private _pendingHoveredElemArea;
    private _lastAppliedHoveredElemArea;
    private _showDragHandleRafId;
    private _surfaceElementUpdatedRafId;
    private readonly _cloneArea;
    private readonly _isAreaEqual;
    private readonly _scheduleShowDragHandleFromSurfaceUpdate;
    private readonly _handleEdgelessToolUpdated;
    private readonly _handleEdgelessViewPortUpdated;
    private readonly _flushShowDragHandle;
    private readonly _showDragHandle;
    private readonly _updateDragHoverRectTopLevelBlock;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    updateAnchorElement: () => void;
    get hoveredElemAreaRect(): Rect | null;
    get hoveredElemArea(): HoveredElemArea | null;
    constructor(widget: AffineDragHandleWidget);
    watch(): void;
}
export {};
//# sourceMappingURL=edgeless-watcher.d.ts.map