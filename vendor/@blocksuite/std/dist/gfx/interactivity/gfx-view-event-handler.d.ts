import type { PointerEventState } from '../../event';
import type { GfxController } from '../controller.js';
import type { SupportedEvent } from '../view/view.js';
export declare class GfxViewEventManager {
    private readonly gfx;
    private _hoveredElementsStack;
    private _draggingElement;
    private _callInReverseOrder;
    constructor(gfx: GfxController);
    dispatch(eventName: SupportedEvent, evt: PointerEventState): boolean | undefined;
    private _handleDrag;
    private _handlePointerMove;
}
//# sourceMappingURL=gfx-view-event-handler.d.ts.map