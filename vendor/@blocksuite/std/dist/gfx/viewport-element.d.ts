import type { Bound } from '@blocksuite/global/gfx';
import { type EditorHost, ShadowlessElement } from '../view';
import { GfxBlockElementModel } from './model/gfx-block-model';
import { Viewport } from './viewport';
/**
 * A wrapper around `requestConnectedFrame` that only calls at most once in one frame
 */
export declare function requestThrottledConnectedFrame<T extends (...args: unknown[]) => void>(func: T, element?: HTMLElement): T;
export declare function getGestureTransformMinInterval({ isPureTranslate, zoom, }: {
    isPureTranslate: boolean;
    zoom: number;
}): 0 | 32;
export declare function shouldSkipGestureTransformWrite({ isPureTranslate, zoom, elapsedMs, }: {
    isPureTranslate: boolean;
    zoom: number;
    elapsedMs: number;
}): boolean;
export declare function shouldUseLowZoomBlockSurvivalMode({ zoom, skipRefreshDuringGesture, gestureActive, }: {
    zoom: number;
    skipRefreshDuringGesture: boolean;
    gestureActive: boolean;
}): boolean;
export declare function getLowZoomGestureActiveModels<T extends {
    elementBound: Bound;
    id: string;
}>({ selectedModels, viewportModels, viewportBounds, nearbyActiveBlockLimit, nearbyDistanceRatio, }: {
    selectedModels: Set<T>;
    viewportModels: Set<T>;
    viewportBounds: Bound;
    nearbyActiveBlockLimit: number;
    nearbyDistanceRatio: number;
}): Set<T>;
declare const GfxViewportElement_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class GfxViewportElement extends GfxViewportElement_base {
    private static readonly VIEWPORT_REFRESH_PIXEL_THRESHOLD;
    private static readonly VIEWPORT_REFRESH_MAX_INTERVAL;
    private get _pixelThreshold();
    private get _maxInterval();
    static styles: import("lit").CSSResult;
    private readonly _parkedBlockViews;
    private readonly _parkedBlockFragment;
    private _shouldParkIdleBlocks;
    private _restoreParkedBlockViews;
    private _syncMountedBlockViews;
    private readonly _hideOutsideAndNoSelectedBlock;
    /**
     * Chunked version of _hideOutsideAndNoSelectedBlock that processes blocks
     * in batches across multiple frames to prevent memory spikes on mobile.
     * Returns a cancel function.
     */
    private _chunkedHideOutsideAndNoSelectedBlock;
    private _lastVisibleModels?;
    private _pendingChunkedHideCancel;
    private _lastViewportUpdate?;
    private _lastViewportRefreshTime;
    private _pendingViewportRefreshTimer;
    private readonly _pendingChildrenUpdates;
    private readonly _refreshViewport;
    private _updatingChildrenFlag;
    private _clearPendingViewportRefreshTimer;
    private _cancelPendingChunkedHide;
    private _scheduleChunkedHide;
    private _scheduleTrailingViewportRefresh;
    private _refreshViewportByViewportUpdate;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    scheduleUpdateChildren?: (id: string) => Promise<void>;
    private _getSelectedModels;
    accessor getModelsInViewport: () => Set<GfxBlockElementModel>;
    accessor host: undefined | EditorHost;
    accessor maxConcurrentRenders: number;
    accessor enableChildrenSchedule: boolean;
    accessor viewport: Viewport;
    setBlocksActive(blockIds: string[]): void;
    setBlocksIdle(blockIds: string[]): void;
}
export {};
//# sourceMappingURL=viewport-element.d.ts.map