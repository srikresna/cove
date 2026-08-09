import type { AffineDragHandleWidget } from '../drag-handle.js';
export declare class PageWatcher {
    readonly widget: AffineDragHandleWidget;
    get pageViewportService(): import("rxjs").Subject<import("@blocksuite/affine-shared/types").Viewport>;
    constructor(widget: AffineDragHandleWidget);
    watch(): void;
}
//# sourceMappingURL=page-watcher.d.ts.map