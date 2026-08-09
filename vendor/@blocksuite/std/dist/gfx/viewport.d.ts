import { Bound, type IPoint, type IVec } from '@blocksuite/global/gfx';
import { BehaviorSubject, Subject } from 'rxjs';
import type { GfxViewportElement } from '.';
export declare const ZOOM_MAX = 6;
export declare const ZOOM_MIN = 0.1;
export declare const ZOOM_STEP = 0.25;
export declare const ZOOM_INITIAL = 1;
export declare const FIT_TO_SCREEN_PADDING = 100;
/**
 * Process-wide defaults applied to every {@link Viewport} at construction.
 *
 * Platforms that need different behavior (e.g. mobile/iOS, which must clamp the
 * zoom floor and defer DOM mutations during gestures to avoid WKWebView process
 * termination) override these once at startup, before any editor mounts. This
 * guarantees both the editor and the readonly preview viewports are born with
 * the same limits — avoiding the race and wrong-instance problems of patching a
 * single Viewport asynchronously after it has already mounted.
 *
 * Desktop leaves these untouched, so its behavior is unchanged.
 */
export declare const viewportRuntimeConfig: {
    ZOOM_MIN: number;
    ZOOM_MAX: number;
    VIEWPORT_REFRESH_PIXEL_THRESHOLD: number;
    VIEWPORT_REFRESH_MAX_INTERVAL: number;
    SKIP_REFRESH_DURING_GESTURE: boolean;
    /**
     * Delay (ms) before the post-gesture refresh repaints canvases and reactivates
     * blocks, used only when {@link SKIP_REFRESH_DURING_GESTURE} is true. The same
     * value drives both the canvas and block refresh timers so they fire together
     * (avoiding the "blocks appear, then connectors" staggered reveal). Desktop
     * never enters that code path, so this is mobile-only.
     */
    POST_GESTURE_REFRESH_DELAY: number;
    /**
     * Caps the canvas backing-store device-pixel-ratio at low zoom.
     *
     * Each entry is `[zoomThreshold, dprCap]`, sorted ascending by threshold.
     * When the live zoom is below a threshold, the corresponding cap bounds the
     * effective dpr used to size canvases. Far-out zoom makes content tiny on
     * screen, so a full retina backing store is wasted memory — on iOS that waste
     * is what pushes WKWebView past its compositing budget and crashes the web
     * content process during pan/zoom.
     *
     * Empty (the desktop default) means no cap: canvases always use the raw
     * `window.devicePixelRatio`, so desktop behavior is unchanged.
     */
    CANVAS_DPR_CAP_BY_ZOOM: Array<[number, number]>;
    /**
     * Fraction by which the *render/activation* viewport bound is enlarged on
     * every side (see {@link Viewport.overscanViewportBounds}). Pre-painting a
     * margin around the visible area means moderate pan/zoom gestures move into
     * content that is already mounted and rasterized, so it does not blank out
     * and wait for the post-gesture refresh.
     *
     * Memory grows by roughly `(1 + 2 * ratio) ** 2`, so this must stay modest
     * and be paired with a zoom floor + dpr cap on mobile. `0` (desktop default)
     * makes {@link Viewport.overscanViewportBounds} identical to
     * {@link Viewport.viewportBounds}, leaving desktop behavior unchanged.
     *
     * This governs the *canvas* render bound only (see
     * {@link Viewport.overscanViewportBounds}). It enlarges the canvas backing
     * stores, so memory grows with the overscan area. Keep it modest and pair it
     * with the mobile zoom floor + dpr cap so connectors/elements stay painted
     * through a gesture without pushing WKWebView over budget.
     */
    OVERSCAN_RATIO: number;
    /**
     * Like {@link OVERSCAN_RATIO} but for the *DOM block mounting* bound (see
     * {@link Viewport.overscanBlockBounds}). This one is expensive: every
     * mounted block becomes its own composited layer subtree in the WebContent
     * process, so enlarging it multiplies resident memory and is what pushes the
     * process toward an iOS jetsam kill. Keep this small (or `0`) even when
     * {@link OVERSCAN_RATIO} is generous. `0` (desktop default) leaves block
     * mounting on the exact visible bound, unchanged from upstream.
     */
    OVERSCAN_RATIO_BLOCK: number;
    /**
     * During low-zoom gesture survival mode, keep only a tiny subset of DOM blocks
     * as real active DOM (selected + a few nearby blocks). `0` keeps the legacy
     * behavior where every viewport block remains visually mounted as `survival`.
     */
    LOW_ZOOM_GESTURE_ACTIVE_BLOCK_LIMIT: number;
    /**
     * Distance threshold (as a fraction of the viewport's shorter side) used to
     * decide whether an unselected viewport block counts as "nearby" to the
     * current selection during low-zoom gesture survival mode.
     */
    LOW_ZOOM_GESTURE_ACTIVE_DISTANCE_RATIO: number;
};
export declare function getPostGestureRecoveryDelay({ isPanning, isZooming, fallbackDelayMs, }: {
    isPanning: boolean;
    isZooming: boolean;
    fallbackDelayMs: number;
}): number;
/**
 * Resolves the effective device-pixel-ratio for canvas backing stores at the
 * given zoom, honoring {@link viewportRuntimeConfig.CANVAS_DPR_CAP_BY_ZOOM}.
 *
 * Returns the raw `window.devicePixelRatio` when no cap applies.
 */
export declare function getEffectiveDpr(zoom: number, rawDpr?: number): number;
export interface ViewportRecord {
    left: number;
    top: number;
    viewportX: number;
    viewportY: number;
    zoom: number;
    viewScale: number;
}
export declare function clientToModelCoord(viewport: ViewportRecord, clientCoord: [number, number]): IVec;
export declare class Viewport {
    private _cachedBoundingClientRect;
    private _cachedOffsetWidth;
    private _resizeObserver;
    private readonly _resizeSubject;
    private _isResizing;
    private _initialTopLeft;
    protected _center: IPoint;
    protected _shell: HTMLElement | null;
    protected _element: GfxViewportElement | null;
    protected _height: number;
    protected _left: number;
    protected _locked: boolean;
    protected _rafId: number | null;
    protected _top: number;
    protected _width: number;
    protected _zoom: number;
    elementReady: Subject<GfxViewportElement>;
    sizeUpdated: Subject<{
        width: number;
        height: number;
        left: number;
        top: number;
    }>;
    resizeStarted: Subject<{
        width: number;
        height: number;
        left: number;
        top: number;
    }>;
    viewportMoved: Subject<IVec>;
    viewportUpdated: Subject<{
        zoom: number;
        center: IVec;
    }>;
    zoomUpdated: Subject<{
        previousZoom: number;
        zoom: number;
    }>;
    zooming$: BehaviorSubject<boolean>;
    panning$: BehaviorSubject<boolean>;
    /**
     * Per-instance override for the maximum zoom. When unset, the value is read
     * dynamically from {@link viewportRuntimeConfig} so that runtime overrides
     * (e.g. iOS mobile-safe limits configured at app startup) always apply,
     * regardless of whether this instance was constructed before or after the
     * override ran.
     */
    private _zoomMaxOverride?;
    private _zoomMinOverride?;
    get ZOOM_MAX(): number;
    set ZOOM_MAX(value: number);
    get ZOOM_MIN(): number;
    set ZOOM_MIN(value: number);
    /**
     * Minimum pixel movement before triggering a viewport refresh during panning.
     * Higher values reduce refresh frequency, lowering memory pressure on mobile.
     * Default: 18 (desktop-optimized).
     */
    VIEWPORT_REFRESH_PIXEL_THRESHOLD: number;
    /**
     * Maximum interval (ms) between viewport refreshes during continuous interaction.
     * Higher values reduce refresh frequency, lowering memory pressure on mobile.
     * Default: 120 (desktop-optimized).
     */
    VIEWPORT_REFRESH_MAX_INTERVAL: number;
    /**
     * When true, viewport element visibility refreshes are skipped entirely during
     * panning/zooming, deferring all DOM mutations until the gesture ends.
     * Prevents JS main thread blocking that can cause WKWebView process termination.
     * Default: false (desktop behavior unchanged).
     */
    SKIP_REFRESH_DURING_GESTURE: boolean;
    LOW_ZOOM_GESTURE_ACTIVE_BLOCK_LIMIT: number;
    LOW_ZOOM_GESTURE_ACTIVE_DISTANCE_RATIO: number;
    private readonly _resetZooming;
    private readonly _resetPanning;
    constructor();
    private _setupResizeObserver;
    private _completeResize;
    private _forceCompleteResize;
    get boundingClientRect(): DOMRect;
    get element(): GfxViewportElement | null;
    get center(): IPoint;
    get centerX(): number;
    get centerY(): number;
    get height(): number;
    get left(): number;
    get locked(): boolean;
    set locked(locked: boolean);
    /**
     * Note this is different from the zoom property.
     * The editor itself may be scaled by outer container which is common in nested editor scenarios.
     * This property is used to calculate the scale of the editor.
     */
    get viewScale(): number;
    get top(): number;
    get translateX(): number;
    get translateY(): number;
    get viewportBounds(): Bound;
    /**
     * Like {@link viewportBounds} but enlarged by
     * {@link viewportRuntimeConfig.OVERSCAN_RATIO} on every side. Used only by
     * the *canvas* render path so that gestures move into already-rasterized
     * vector content instead of blank space. This also enlarges the canvas
     * backing store, so keep the ratio conservative.
     *
     * Hit-testing, selection and other geometry must keep using the exact
     * {@link viewportBounds}; do not substitute this for those.
     */
    get overscanViewportBounds(): Bound;
    /**
     * Like {@link overscanViewportBounds} but governed by the separate, smaller
     * {@link viewportRuntimeConfig.OVERSCAN_RATIO_BLOCK}. Used only by the *DOM
     * block mounting* path. Expensive: every mounted block adds a composited
     * layer subtree, so this must stay small to keep the WebContent process
     * under the iOS jetsam memory limit even when canvas overscan is generous.
     */
    get overscanBlockBounds(): Bound;
    private _enlargeBounds;
    get viewportMaxXY(): {
        x: number;
        y: number;
    };
    get viewportMinXY(): {
        x: number;
        y: number;
    };
    get viewportX(): number;
    get viewportY(): number;
    get width(): number;
    get zoom(): number;
    applyDeltaCenter(deltaX: number, deltaY: number): void;
    clearViewportElement(): void;
    dispose(): void;
    getFitToScreenData(bounds?: Bound | null, padding?: [number, number, number, number], maxZoom?: number, fitToScreenPadding?: number): {
        zoom: number;
        centerX: number;
        centerY: number;
    };
    isInViewport(bound: Bound): boolean;
    onResize(): void;
    /**
     * Set the center of the viewport.
     * @param centerX The new x coordinate of the center of the viewport.
     * @param centerY The new y coordinate of the center of the viewport.
     * @param forceUpdate Whether to force complete any pending resize operations before setting the viewport.
     */
    setCenter(centerX: number, centerY: number, forceUpdate?: boolean, signalPanning?: boolean): void;
    setRect(left: number, top: number, width: number, height: number): void;
    /**
     * Set the viewport to the new zoom and center.
     * @param newZoom The new zoom value.
     * @param newCenter The new center of the viewport.
     * @param smooth Whether to animate the zooming and panning.
     * @param forceUpdate Whether to force complete any pending resize operations before setting the viewport.
     */
    setViewport(newZoom: number, newCenter?: IVec, smooth?: boolean, forceUpdate?: boolean, signalGesture?: boolean): void;
    /**
     * Set the viewport to fit the bound with padding.
     * @param bound The bound will be zoomed to fit the viewport.
     * @param padding The padding will be applied to the bound after zooming, default is [0, 0, 0, 0],
     *                the value may be reduced if there is not enough space for the padding.
     *                Use decimal less than 1 to represent percentage padding. e.g. [0.1, 0.1, 0.1, 0.1] means 10% padding.
     * @param smooth whether to animate the zooming
     * @param forceUpdate whether to force complete any pending resize operations before setting the viewport
     */
    setViewportByBound(bound: Bound, padding?: [number, number, number, number], smooth?: boolean, forceUpdate?: boolean, signalGesture?: boolean): void;
    /** This is the outer container of the viewport, which is the host of the viewport element */
    setShellElement(el: HTMLElement): void;
    /**
     * Set the viewport to the new zoom.
     * @param zoom The new zoom value.
     * @param focusPoint The point to focus on after zooming, default is the center of the viewport.
     * @param _wheel Legacy parameter kept for call-site compatibility.
     * @param forceUpdate Whether to force complete any pending resize operations before setting the viewport.
     */
    setZoom(zoom: number, focusPoint?: IPoint, _wheel?: boolean, forceUpdate?: boolean, signalGesture?: boolean): void;
    smoothTranslate(x: number, y: number, numSteps?: number, signalGesture?: boolean): void;
    smoothZoom(zoom: number, focusPoint?: IPoint, numSteps?: number, signalGesture?: boolean): void;
    toModelBound(bound: Bound): Bound;
    toModelCoord(viewX: number, viewY: number, zoom?: number, center?: IPoint): IVec;
    toModelCoordFromClientCoord([x, y]: IVec): IVec;
    toViewBound(bound: Bound): Bound;
    toViewCoord(modelX: number, modelY: number): IVec;
    toViewCoordFromClientCoord([x, y]: IVec): IVec;
    serializeRecord(): string;
    deserializeRecord(record?: string): ViewportRecord | null;
}
//# sourceMappingURL=viewport.d.ts.map