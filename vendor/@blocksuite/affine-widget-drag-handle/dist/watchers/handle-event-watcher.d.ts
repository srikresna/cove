import type { AffineDragHandleWidget } from '../drag-handle.js';
export declare class HandleEventWatcher {
    readonly widget: AffineDragHandleWidget;
    private readonly _onDragHandlePointerDown;
    private readonly _onDragHandlePointerEnter;
    private readonly _onDragHandlePointerLeave;
    private readonly _onDragHandlePointerUp;
    constructor(widget: AffineDragHandleWidget);
    watch(): void;
}
//# sourceMappingURL=handle-event-watcher.d.ts.map