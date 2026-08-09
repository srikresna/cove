import { type Color, ColorScheme } from '@blocksuite/affine-model';
import { Bound, type IBound } from '@blocksuite/global/gfx';
import type { BlockStdScope } from '@blocksuite/std';
import type { GfxLocalElementModel, GridManager, LayerManager, SurfaceBlockModel, Viewport } from '@blocksuite/std/gfx';
import { Subject } from 'rxjs';
import type { SurfaceElementModel } from '../element-model/base.js';
import type { Overlay } from './overlay.js';
type EnvProvider = {
    generateColorProperty: (color: Color, fallback?: Color) => string;
    getColorScheme: () => ColorScheme;
    getColorValue: (color: Color, fallback?: Color, real?: boolean) => string;
    getPropertyValue: (property: string) => string;
    selectedElements?: () => string[];
};
type RendererOptions = {
    std: BlockStdScope;
    viewport: Viewport;
    layerManager: LayerManager;
    provider?: Partial<EnvProvider>;
    enableStackingCanvas?: boolean;
    onStackingCanvasCreated?: (canvas: HTMLCanvasElement) => void;
    gridManager: GridManager;
    surfaceModel: SurfaceBlockModel;
};
export type CanvasRenderPassMetrics = {
    overlayCount: number;
    placeholderElementCount: number;
    renderByBoundCallCount: number;
    renderedElementCount: number;
    visibleElementCount: number;
};
export type CanvasMemorySnapshot = {
    bytes: number;
    datasetLayerId: string | null;
    height: number;
    kind: 'main' | 'stacking';
    width: number;
    zIndex: string;
};
export type CanvasRendererDebugMetrics = {
    canvasLayerCount: number;
    canvasMemoryBytes: number;
    canvasMemorySnapshots: CanvasMemorySnapshot[];
    canvasMemoryMegabytes: number;
    canvasPixelCount: number;
    coalescedRefreshCount: number;
    dirtyLayerRenderCount: number;
    fallbackElementCount: number;
    lastRenderDurationMs: number;
    lastRenderMetrics: CanvasRenderPassMetrics;
    maxRenderDurationMs: number;
    pooledStackingCanvasCount: number;
    refreshCount: number;
    renderCount: number;
    stackingCanvasCount: number;
    totalLayerCount: number;
    totalRenderDurationMs: number;
    visibleStackingCanvasCount: number;
};
type RefreshTarget = {
    type: 'all';
} | {
    type: 'main';
} | {
    type: 'element';
    element: SurfaceElementModel | GfxLocalElementModel;
} | {
    type: 'elements';
    elements: Array<SurfaceElementModel | GfxLocalElementModel>;
};
export declare function shouldSyncCanvasBudgetOnViewportUpdate(previousZoom: number, nextZoom: number, rawDpr?: number): boolean;
export declare function shouldUseLowZoomSurvivalMode(isIOS: boolean, zoom: number, gestureActive: boolean): boolean;
export declare function getStackingCanvasBypassState(params: {
    isIOS: boolean;
    zoom: number;
    gestureActive: boolean;
    recoveryActive: boolean;
    viewportWidth: number;
    viewportHeight: number;
}): boolean;
export declare function shouldBypassStackingCanvasesDuringLowZoomGesture(params: {
    isIOS: boolean;
    zoom: number;
    gestureActive: boolean;
    recoveryActive: boolean;
    viewportWidth: number;
    viewportHeight: number;
}): boolean;
export declare function getStackingCanvasAttachmentDiff(params: {
    canvases: HTMLCanvasElement[];
    wasAttached: boolean;
    shouldAttach: boolean;
}): {
    added: HTMLCanvasElement[];
    removed: never[];
} | {
    added: never[];
    removed: HTMLCanvasElement[];
};
export declare function getMainCanvasFallbackBounds(params: {
    viewportBounds: Bound;
    overscanViewportBounds: Bound;
}): {
    cullBound: Bound;
    renderBound: Bound;
};
export declare function getCanvasViewportLayout(params: {
    bound: Bound;
    viewportBounds: Bound;
    zoom: number;
    viewScale: number;
    dpr: number;
}): {
    actualHeight: number;
    actualWidth: number;
    height: number;
    transform: string;
    width: number;
};
export declare function shouldRenderCanvasPlaceholders(params: {
    isIOS: boolean;
    zoom: number;
    isPanning: boolean;
    isZooming: boolean;
    skipRefreshDuringGesture: boolean;
    turboEnabled: boolean;
}): boolean;
export declare class CanvasRenderer {
    private _container;
    private readonly _disposables;
    private readonly _gfx;
    private readonly _turboEnabled;
    private readonly _overlays;
    private _refreshRafId;
    private _stackingCanvas;
    private readonly _stackingCanvasPool;
    private readonly _stackingCanvasState;
    private readonly _dirtyStackingCanvasIndexes;
    private _mainCanvasDirty;
    private _needsFullRender;
    private _lastCanvasBudgetZoom;
    private _lastLowZoomSurvivalMode;
    private _lastBypassStackingCanvases;
    private _stackingCanvasesAttached;
    private _stackingCanvasRecoveryUntil;
    private _stackingCanvasRecoveryTimerId;
    private _debugMetrics;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    std: BlockStdScope;
    grid: GridManager;
    layerManager: LayerManager;
    provider: Partial<EnvProvider>;
    stackingCanvasUpdated: Subject<{
        canvases: HTMLCanvasElement[];
        added: HTMLCanvasElement[];
        removed: HTMLCanvasElement[];
    }>;
    usePlaceholder: boolean;
    viewport: Viewport;
    get stackingCanvas(): HTMLCanvasElement[];
    get stackingCanvasesAttached(): boolean;
    constructor(options: RendererOptions);
    /**
     * Specifying the actual size gives better results and more consistent behavior across browsers.
     *
     * Make sure the main canvas and the offscreen canvas or layer canvas are the same size.
     *
     * It is not recommended to set width and height to 100%.
     */
    private _canvasSizeUpdater;
    private _applyStackingCanvasLayout;
    private _clampBoundToViewport;
    private _createCanvasForLayer;
    private _findLayerIndexByElement;
    private _getLayerRenderBound;
    private _getResolvedStackingCanvasBound;
    private _invalidate;
    private _resetPooledCanvas;
    private _syncStackingCanvasAttachment;
    private _isStackingCanvasRecoveryActive;
    private _clearStackingCanvasRecoveryTimer;
    private _scheduleStackingCanvasRecoveryWindow;
    private _syncCanvasBudgetForViewportZoom;
    private _updatePlaceholderMode;
    private _initStackingCanvas;
    private _initViewport;
    private _createRenderPassStats;
    private _getCanvasMemorySnapshots;
    private _render;
    private _lastDebugSnapshot;
    private _renderByBound;
    private _resetSize;
    private _watchSurface;
    addOverlay(overlay: Overlay): void;
    /**
     * Used to attach main canvas, main canvas will always exist
     * @param container
     */
    attach(container: HTMLElement): void;
    dispose(): void;
    generateColorProperty(color: Color, fallback?: Color): string;
    getCanvasByBound(bound?: IBound, surfaceElements?: SurfaceElementModel[], canvas?: HTMLCanvasElement, clearBeforeDrawing?: boolean, withZoom?: boolean): HTMLCanvasElement;
    getColorScheme(): ColorScheme;
    getColorValue(color: Color, fallback?: Color, real?: boolean): string;
    getPropertyValue(property: string): string;
    getDebugMetrics(): CanvasRendererDebugMetrics;
    resetDebugMetrics(): void;
    refresh(target?: RefreshTarget): void;
    removeOverlay(overlay: Overlay): void;
}
export {};
//# sourceMappingURL=canvas-renderer.d.ts.map