import { Rect } from '@blocksuite/global/gfx';
import type { AffineDragHandleWidget } from '../drag-handle.js';
export declare class RectHelper {
    readonly widget: AffineDragHandleWidget;
    private readonly _getHoveredBlocks;
    getDraggingAreaRect: () => Rect | null;
    constructor(widget: AffineDragHandleWidget);
}
//# sourceMappingURL=rect-helper.d.ts.map