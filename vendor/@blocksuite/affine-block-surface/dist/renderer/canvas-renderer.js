import { ColorScheme } from '@blocksuite/affine-model';
import { FeatureFlagService } from '@blocksuite/affine-shared/services';
import { requestConnectedFrame } from '@blocksuite/affine-shared/utils';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { IS_IOS } from '@blocksuite/global/env';
import { Bound, getBoundWithRotation, intersects, } from '@blocksuite/global/gfx';
import { getEffectiveDpr, getPostGestureRecoveryDelay, GfxControllerIdentifier, viewportRuntimeConfig, } from '@blocksuite/std/gfx';
import { effect } from '@preact/signals-core';
import last from 'lodash-es/last';
import { Subject } from 'rxjs';
import { ElementRendererIdentifier } from '../extensions/element-renderer.js';
import { RoughCanvas } from '../utils/rough/canvas.js';
import { resolveSurfacePlaceholderColor } from './placeholder-style.js';
const STACKING_CANVAS_PADDING = 32;
const IOS_LOW_ZOOM_SURVIVAL_THRESHOLD = 0.5;
export function shouldSyncCanvasBudgetOnViewportUpdate(previousZoom, nextZoom, rawDpr = window.devicePixelRatio) {
    if (rawDpr <= 1) {
        return false;
    }
    return (getEffectiveDpr(previousZoom, rawDpr) !== getEffectiveDpr(nextZoom, rawDpr));
}
export function shouldUseLowZoomSurvivalMode(isIOS, zoom, gestureActive) {
    return isIOS && gestureActive && zoom <= IOS_LOW_ZOOM_SURVIVAL_THRESHOLD;
}
export function getStackingCanvasBypassState(params) {
    const { isIOS, zoom, gestureActive, recoveryActive, viewportWidth, viewportHeight, } = params;
    return (isIOS &&
        zoom <= IOS_LOW_ZOOM_SURVIVAL_THRESHOLD &&
        (gestureActive || recoveryActive) &&
        viewportWidth > viewportHeight);
}
export function shouldBypassStackingCanvasesDuringLowZoomGesture(params) {
    return getStackingCanvasBypassState(params);
}
export function getStackingCanvasAttachmentDiff(params) {
    const { canvases, wasAttached, shouldAttach } = params;
    if (wasAttached === shouldAttach) {
        return {
            added: [],
            removed: [],
        };
    }
    return shouldAttach
        ? {
            added: canvases,
            removed: [],
        }
        : {
            added: [],
            removed: canvases,
        };
}
export function getMainCanvasFallbackBounds(params) {
    const { overscanViewportBounds } = params;
    return {
        cullBound: overscanViewportBounds,
        renderBound: overscanViewportBounds,
    };
}
export function getCanvasViewportLayout(params) {
    const { bound, viewportBounds, zoom, viewScale, dpr } = params;
    const width = bound.w * zoom;
    const height = bound.h * zoom;
    const left = (bound.x - viewportBounds.x) * zoom;
    const top = (bound.y - viewportBounds.y) * zoom;
    return {
        actualHeight: Math.max(0, Math.ceil(height * dpr)),
        actualWidth: Math.max(0, Math.ceil(width * dpr)),
        height,
        transform: `translate(${left}px, ${top}px) scale(${1 / viewScale})`,
        width,
    };
}
function applyCanvasViewportLayout(canvas, layout) {
    const width = `${layout.width}px`;
    const height = `${layout.height}px`;
    if (canvas.style.left !== '0px') {
        canvas.style.left = '0px';
    }
    if (canvas.style.top !== '0px') {
        canvas.style.top = '0px';
    }
    if (canvas.style.width !== width) {
        canvas.style.width = width;
    }
    if (canvas.style.height !== height) {
        canvas.style.height = height;
    }
    if (canvas.style.transform !== layout.transform) {
        canvas.style.transform = layout.transform;
    }
    if (canvas.style.transformOrigin !== 'top left') {
        canvas.style.transformOrigin = 'top left';
    }
    if (canvas.width !== layout.actualWidth) {
        canvas.width = layout.actualWidth;
    }
    if (canvas.height !== layout.actualHeight) {
        canvas.height = layout.actualHeight;
    }
}
export function shouldRenderCanvasPlaceholders(params) {
    const { isIOS, zoom, isPanning, isZooming, skipRefreshDuringGesture, turboEnabled, } = params;
    if (shouldUseLowZoomSurvivalMode(isIOS, zoom, isZooming)) {
        return true;
    }
    return !skipRefreshDuringGesture && turboEnabled && isZooming && !isPanning;
}
export class CanvasRenderer {
    get stackingCanvas() {
        return this._stackingCanvas;
    }
    get stackingCanvasesAttached() {
        return this._stackingCanvasesAttached;
    }
    constructor(options) {
        this._disposables = new DisposableGroup();
        this._overlays = new Set();
        this._refreshRafId = null;
        this._stackingCanvas = [];
        this._stackingCanvasPool = [];
        this._stackingCanvasState = new WeakMap();
        this._dirtyStackingCanvasIndexes = new Set();
        this._mainCanvasDirty = true;
        this._needsFullRender = true;
        this._lastCanvasBudgetZoom = 1;
        this._lastLowZoomSurvivalMode = false;
        this._lastBypassStackingCanvases = false;
        this._stackingCanvasesAttached = true;
        this._stackingCanvasRecoveryUntil = 0;
        this._stackingCanvasRecoveryTimerId = null;
        this._debugMetrics = {
            refreshCount: 0,
            coalescedRefreshCount: 0,
            renderCount: 0,
            totalRenderDurationMs: 0,
            lastRenderDurationMs: 0,
            maxRenderDurationMs: 0,
            lastRenderMetrics: {
                renderByBoundCallCount: 0,
                visibleElementCount: 0,
                renderedElementCount: 0,
                placeholderElementCount: 0,
                overlayCount: 0,
            },
            dirtyLayerRenderCount: 0,
            fallbackElementCount: 0,
        };
        this.stackingCanvasUpdated = new Subject();
        this.usePlaceholder = false;
        this._lastDebugSnapshot = {
            canvasMemoryBytes: 0,
            canvasMemorySnapshots: [],
            canvasPixelCount: 0,
            canvasLayerCount: 0,
            pooledStackingCanvasCount: 0,
            stackingCanvasCount: 0,
            totalLayerCount: 0,
            visibleStackingCanvasCount: 0,
        };
        const canvas = document.createElement('canvas');
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.std = options.std;
        this.viewport = options.viewport;
        this._lastCanvasBudgetZoom = this.viewport.zoom;
        this.layerManager = options.layerManager;
        this.grid = options.gridManager;
        this.provider = options.provider ?? {};
        this._gfx = this.std.get(GfxControllerIdentifier);
        this._turboEnabled = () => {
            const featureFlagService = options.std.get(FeatureFlagService);
            return featureFlagService.getFlag('enable_turbo_renderer');
        };
        this._initViewport();
        options.enableStackingCanvas = options.enableStackingCanvas ?? false;
        if (options.enableStackingCanvas) {
            this._initStackingCanvas(options.onStackingCanvasCreated);
        }
        this._watchSurface(options.surfaceModel);
    }
    /**
     * Specifying the actual size gives better results and more consistent behavior across browsers.
     *
     * Make sure the main canvas and the offscreen canvas or layer canvas are the same size.
     *
     * It is not recommended to set width and height to 100%.
     */
    _canvasSizeUpdater(bound = this.viewport.overscanViewportBounds, dpr = getEffectiveDpr(this.viewport.zoom)) {
        const layout = getCanvasViewportLayout({
            bound,
            viewportBounds: this.viewport.viewportBounds,
            zoom: this.viewport.zoom,
            viewScale: this.viewport.viewScale,
            dpr,
        });
        return {
            filter(canvas) {
                return (canvas.width !== layout.actualWidth ||
                    canvas.height !== layout.actualHeight ||
                    canvas.style.transform !== layout.transform);
            },
            update(canvas) {
                applyCanvasViewportLayout(canvas, layout);
            },
        };
    }
    _applyStackingCanvasLayout(canvas, bound, dpr = getEffectiveDpr(this.viewport.zoom)) {
        const state = this._stackingCanvasState.get(canvas) ??
            {
                bound: null,
                layerId: canvas.dataset.layerId ?? null,
            };
        if (!bound || bound.w <= 0 || bound.h <= 0) {
            canvas.style.display = 'none';
            canvas.style.left = '0px';
            canvas.style.top = '0px';
            canvas.style.width = '0px';
            canvas.style.height = '0px';
            canvas.style.transform = '';
            canvas.width = 0;
            canvas.height = 0;
            state.bound = null;
            state.layerId = canvas.dataset.layerId ?? null;
            this._stackingCanvasState.set(canvas, state);
            return;
        }
        const layout = getCanvasViewportLayout({
            bound,
            viewportBounds: this.viewport.viewportBounds,
            zoom: this.viewport.zoom,
            viewScale: this.viewport.viewScale,
            dpr,
        });
        if (canvas.style.display !== 'block') {
            canvas.style.display = 'block';
        }
        applyCanvasViewportLayout(canvas, layout);
        state.bound = bound;
        state.layerId = canvas.dataset.layerId ?? null;
        this._stackingCanvasState.set(canvas, state);
    }
    _clampBoundToViewport(bound, viewportBounds) {
        const minX = Math.max(bound.x, viewportBounds.x);
        const minY = Math.max(bound.y, viewportBounds.y);
        const maxX = Math.min(bound.maxX, viewportBounds.maxX);
        const maxY = Math.min(bound.maxY, viewportBounds.maxY);
        if (maxX <= minX || maxY <= minY) {
            return null;
        }
        return new Bound(minX, minY, maxX - minX, maxY - minY);
    }
    _createCanvasForLayer(onCreated) {
        const reused = this._stackingCanvasPool.pop();
        if (reused) {
            return reused;
        }
        const created = document.createElement('canvas');
        onCreated?.(created);
        return created;
    }
    _findLayerIndexByElement(element) {
        const canvasLayers = this.layerManager.getCanvasLayers();
        const index = canvasLayers.findIndex(layer => layer.elements.some(layerElement => layerElement.id === element.id));
        return index === -1 ? null : index;
    }
    _getLayerRenderBound(elements, viewportBounds) {
        let layerBound = null;
        for (const element of elements) {
            const display = (element.display ?? true) && !element.hidden;
            if (!display) {
                continue;
            }
            const elementBound = Bound.from(getBoundWithRotation(element));
            if (!intersects(elementBound, viewportBounds)) {
                continue;
            }
            layerBound = layerBound ? layerBound.unite(elementBound) : elementBound;
        }
        if (!layerBound) {
            return null;
        }
        return this._clampBoundToViewport(layerBound.expand(STACKING_CANVAS_PADDING), viewportBounds);
    }
    _getResolvedStackingCanvasBound(canvas, bound) {
        if (!bound || !this._gfx.tool.dragging$.peek()) {
            return bound;
        }
        const previousBound = this._stackingCanvasState.get(canvas)?.bound;
        return previousBound ? previousBound.unite(bound) : bound;
    }
    _invalidate(target = { type: 'all' }) {
        if (target.type === 'all') {
            this._needsFullRender = true;
            this._mainCanvasDirty = true;
            this._dirtyStackingCanvasIndexes.clear();
            return;
        }
        if (this._needsFullRender) {
            return;
        }
        if (target.type === 'main') {
            this._mainCanvasDirty = true;
            return;
        }
        const elements = target.type === 'element' ? [target.element] : target.elements;
        for (const element of elements) {
            const layerIndex = this._findLayerIndexByElement(element);
            if (layerIndex === null || layerIndex >= this._stackingCanvas.length) {
                this._mainCanvasDirty = true;
                continue;
            }
            this._dirtyStackingCanvasIndexes.add(layerIndex);
        }
    }
    _resetPooledCanvas(canvas) {
        canvas.dataset.layerId = '';
        this._applyStackingCanvasLayout(canvas, null);
    }
    _syncStackingCanvasAttachment(shouldAttach) {
        const payloadDiff = getStackingCanvasAttachmentDiff({
            canvases: this._stackingCanvas,
            wasAttached: this._stackingCanvasesAttached,
            shouldAttach,
        });
        this._stackingCanvasesAttached = shouldAttach;
        if (!payloadDiff.added.length && !payloadDiff.removed.length) {
            return;
        }
        this.stackingCanvasUpdated.next({
            canvases: this._stackingCanvas,
            ...payloadDiff,
        });
    }
    _isStackingCanvasRecoveryActive() {
        return this._stackingCanvasRecoveryUntil > performance.now();
    }
    _clearStackingCanvasRecoveryTimer() {
        if (this._stackingCanvasRecoveryTimerId !== null) {
            clearTimeout(this._stackingCanvasRecoveryTimerId);
            this._stackingCanvasRecoveryTimerId = null;
        }
    }
    _scheduleStackingCanvasRecoveryWindow(delayMs = viewportRuntimeConfig.POST_GESTURE_REFRESH_DELAY) {
        this._clearStackingCanvasRecoveryTimer();
        this._stackingCanvasRecoveryUntil = performance.now() + delayMs;
        this._stackingCanvasRecoveryTimerId = setTimeout(() => {
            this._stackingCanvasRecoveryTimerId = null;
            this._stackingCanvasRecoveryUntil = 0;
            if (this._container) {
                this._updatePlaceholderMode();
            }
        }, delayMs);
    }
    _syncCanvasBudgetForViewportZoom() {
        const nextZoom = this.viewport.zoom;
        if (!shouldSyncCanvasBudgetOnViewportUpdate(this._lastCanvasBudgetZoom, nextZoom)) {
            this._lastCanvasBudgetZoom = nextZoom;
            return;
        }
        this._lastCanvasBudgetZoom = nextZoom;
        this._resetSize();
        this._render();
    }
    _updatePlaceholderMode() {
        const gestureActive = this.viewport.panning$.value || this.viewport.zooming$.value;
        const recoveryActive = this._isStackingCanvasRecoveryActive();
        const lowZoomSurvivalMode = shouldUseLowZoomSurvivalMode(IS_IOS, this.viewport.zoom, gestureActive);
        const shouldBypassStackingCanvases = shouldBypassStackingCanvasesDuringLowZoomGesture({
            isIOS: IS_IOS,
            zoom: this.viewport.zoom,
            gestureActive,
            recoveryActive,
            viewportWidth: this.viewport.width,
            viewportHeight: this.viewport.height,
        });
        const shouldRenderPlaceholders = shouldRenderCanvasPlaceholders({
            isIOS: IS_IOS,
            zoom: this.viewport.zoom,
            isPanning: this.viewport.panning$.value,
            isZooming: this.viewport.zooming$.value,
            skipRefreshDuringGesture: this.viewport.SKIP_REFRESH_DURING_GESTURE,
            turboEnabled: this._turboEnabled(),
        });
        const bypassModeChanged = this._lastBypassStackingCanvases !== shouldBypassStackingCanvases;
        this._syncStackingCanvasAttachment(!shouldBypassStackingCanvases);
        if (this.usePlaceholder === shouldRenderPlaceholders) {
            this._lastLowZoomSurvivalMode = lowZoomSurvivalMode;
            this._lastBypassStackingCanvases = shouldBypassStackingCanvases;
            if (bypassModeChanged) {
                this.refresh({ type: 'all' });
            }
            return;
        }
        this.usePlaceholder = shouldRenderPlaceholders;
        const survivalModeChanged = this._lastLowZoomSurvivalMode !== lowZoomSurvivalMode;
        this._lastLowZoomSurvivalMode = lowZoomSurvivalMode;
        this._lastBypassStackingCanvases = shouldBypassStackingCanvases;
        if (survivalModeChanged ||
            bypassModeChanged ||
            !this.viewport.SKIP_REFRESH_DURING_GESTURE ||
            !gestureActive) {
            this.refresh({ type: 'all' });
        }
    }
    _initStackingCanvas(onCreated) {
        const layer = this.layerManager;
        const updateStackingCanvas = () => {
            /**
             * we already have a main canvas, so the last layer should be skipped
             */
            const canvasLayers = layer.getCanvasLayers().slice(0, -1);
            const canvases = [];
            const currentCanvases = this._stackingCanvas;
            const lastLayer = last(this.layerManager.layers);
            const maximumZIndex = lastLayer
                ? lastLayer.zIndex + lastLayer.elements.length + 1
                : 1;
            this.canvas.style.zIndex = maximumZIndex.toString();
            for (let i = 0; i < canvasLayers.length; ++i) {
                const layer = canvasLayers[i];
                const created = i < currentCanvases.length;
                const canvas = created
                    ? currentCanvases[i]
                    : this._createCanvasForLayer(onCreated);
                canvas.dataset.layerId = `[${layer.indexes[0]}--${layer.indexes[1]}]`;
                canvas.style.zIndex = layer.zIndex.toString();
                canvases.push(canvas);
            }
            this._stackingCanvas = canvases;
            if (currentCanvases.length !== canvases.length) {
                const diff = canvases.length - currentCanvases.length;
                const payload = {
                    canvases,
                    removed: [],
                    added: [],
                };
                if (diff > 0) {
                    if (this._stackingCanvasesAttached) {
                        payload.added = canvases.slice(-diff);
                    }
                }
                else {
                    payload.removed = currentCanvases.slice(diff);
                    payload.removed.forEach(canvas => {
                        this._resetPooledCanvas(canvas);
                        this._stackingCanvasPool.push(canvas);
                    });
                }
                if (payload.added.length || payload.removed.length) {
                    this.stackingCanvasUpdated.next(payload);
                }
            }
            this.refresh({ type: 'all' });
        };
        this._disposables.add(this.layerManager.slots.layerUpdated.subscribe(() => {
            updateStackingCanvas();
        }));
        updateStackingCanvas();
    }
    _initViewport() {
        let sizeUpdatedRafId = null;
        this._disposables.add({
            dispose: () => this._clearStackingCanvasRecoveryTimer(),
        });
        this._disposables.add(this.viewport.zoomUpdated.subscribe(() => {
            this._syncCanvasBudgetForViewportZoom();
        }));
        this._disposables.add(this.viewport.viewportUpdated.subscribe(() => {
            this._updatePlaceholderMode();
            if (this.viewport.SKIP_REFRESH_DURING_GESTURE &&
                (this.viewport.panning$.value || this.viewport.zooming$.value)) {
                return;
            }
            this.refresh({ type: 'all' });
        }));
        this._disposables.add(this.viewport.sizeUpdated.subscribe(() => {
            if (IS_IOS &&
                this.viewport.zoom <= IOS_LOW_ZOOM_SURVIVAL_THRESHOLD &&
                this.viewport.width > this.viewport.height) {
                this._scheduleStackingCanvasRecoveryWindow();
                if (this._container) {
                    this._updatePlaceholderMode();
                }
            }
            if (sizeUpdatedRafId)
                return;
            sizeUpdatedRafId = requestConnectedFrame(() => {
                sizeUpdatedRafId = null;
                this._resetSize();
                // When SKIP_REFRESH_DURING_GESTURE is active, schedule the render
                // after a short delay to let the layout settle on orientation change,
                // avoiding a white-flash from resizing + rendering in the same frame.
                if (this.viewport.SKIP_REFRESH_DURING_GESTURE) {
                    setTimeout(() => this._render(), 16);
                }
                else {
                    this._render();
                }
            }, this._container);
        }));
        this._disposables.add(this.viewport.zooming$.subscribe(() => {
            this._updatePlaceholderMode();
        }));
        // When SKIP_REFRESH_DURING_GESTURE is enabled, defer heavy canvas work
        // while the gesture is still in-flight, but start the first recovery frame
        // immediately once both gesture signals have fully settled.
        if (this.viewport.SKIP_REFRESH_DURING_GESTURE) {
            let pendingCanvasTimerId = null;
            const cancelPendingCanvasRefresh = () => {
                if (pendingCanvasTimerId !== null) {
                    clearTimeout(pendingCanvasTimerId);
                    pendingCanvasTimerId = null;
                }
            };
            const scheduleCanvasRefresh = () => {
                cancelPendingCanvasRefresh();
                const delayMs = getPostGestureRecoveryDelay({
                    isPanning: this.viewport.panning$.value,
                    isZooming: this.viewport.zooming$.value,
                    fallbackDelayMs: viewportRuntimeConfig.POST_GESTURE_REFRESH_DELAY,
                });
                pendingCanvasTimerId = setTimeout(() => {
                    pendingCanvasTimerId = null;
                    // If a gesture is still in-flight when the timer fires, reschedule
                    // instead of dropping. Dropping here left connectors blank until a
                    // tap forced a synchronous refresh.
                    if (this.viewport.panning$.value || this.viewport.zooming$.value) {
                        scheduleCanvasRefresh();
                        return;
                    }
                    this.refresh({ type: 'all' });
                }, delayMs);
            };
            this._disposables.add(this.viewport.panning$.subscribe(panning => {
                this._updatePlaceholderMode();
                if (panning) {
                    cancelPendingCanvasRefresh();
                }
                else {
                    scheduleCanvasRefresh();
                }
            }));
            this._disposables.add(this.viewport.zooming$.subscribe(zooming => {
                this._updatePlaceholderMode();
                if (zooming) {
                    cancelPendingCanvasRefresh();
                }
                else {
                    scheduleCanvasRefresh();
                }
            }));
            this._disposables.add({ dispose: cancelPendingCanvasRefresh });
        }
        let wasDragging = false;
        this._disposables.add(effect(() => {
            const isDragging = this._gfx.tool.dragging$.value;
            if (wasDragging && !isDragging) {
                if (this.viewport.panning$.value || this.viewport.zooming$.value) {
                    // Deferred refresh will handle it after gesture ends
                }
                else {
                    this.refresh({ type: 'all' });
                }
            }
            wasDragging = isDragging;
        }));
        this.usePlaceholder = false;
    }
    _createRenderPassStats() {
        return {
            renderByBoundCallCount: 0,
            visibleElementCount: 0,
            renderedElementCount: 0,
            placeholderElementCount: 0,
            overlayCount: 0,
        };
    }
    _getCanvasMemorySnapshots() {
        return [this.canvas, ...this._stackingCanvas].map((canvas, index) => {
            return {
                kind: index === 0 ? 'main' : 'stacking',
                width: canvas.width,
                height: canvas.height,
                bytes: canvas.width * canvas.height * 4,
                zIndex: canvas.style.zIndex,
                datasetLayerId: canvas.dataset.layerId ?? null,
            };
        });
    }
    _render() {
        const renderStart = performance.now();
        const { overscanViewportBounds, viewportBounds, zoom } = this.viewport;
        const { cullBound: mainCanvasCullBound, renderBound: mainCanvasRenderBound, } = getMainCanvasFallbackBounds({
            viewportBounds,
            overscanViewportBounds,
        });
        const { ctx } = this;
        const dpr = getEffectiveDpr(zoom);
        const scale = zoom * dpr;
        const matrix = new DOMMatrix().scaleSelf(scale);
        const renderStats = this._createRenderPassStats();
        const fullRender = this._needsFullRender;
        const bypassStackingCanvases = getStackingCanvasBypassState({
            isIOS: IS_IOS,
            zoom: this.viewport.zoom,
            gestureActive: this.viewport.panning$.value || this.viewport.zooming$.value,
            recoveryActive: this._isStackingCanvasRecoveryActive(),
            viewportWidth: this.viewport.width,
            viewportHeight: this.viewport.height,
        });
        const stackingIndexesToRender = bypassStackingCanvases
            ? []
            : fullRender
                ? this._stackingCanvas.map((_, idx) => idx)
                : [...this._dirtyStackingCanvasIndexes];
        /**
         * if a layer does not have a corresponding canvas
         * its element will be add to this array and drawing on the
         * main canvas
         */
        let fallbackElement = [];
        const allCanvasLayers = this.layerManager.getCanvasLayers();
        const stackingViewportBound = Bound.from(overscanViewportBounds);
        this._canvasSizeUpdater(mainCanvasRenderBound, dpr).update(this.canvas);
        if (bypassStackingCanvases) {
            this._stackingCanvas.forEach(canvas => {
                this._applyStackingCanvasLayout(canvas, null, dpr);
            });
        }
        for (const idx of stackingIndexesToRender) {
            const layer = allCanvasLayers[idx];
            const canvas = this._stackingCanvas[idx];
            if (!layer || !canvas) {
                continue;
            }
            const layerRenderBound = this._getLayerRenderBound(layer.elements, stackingViewportBound);
            const resolvedLayerRenderBound = this._getResolvedStackingCanvasBound(canvas, layerRenderBound);
            this._applyStackingCanvasLayout(canvas, resolvedLayerRenderBound);
            if (!resolvedLayerRenderBound ||
                canvas.width === 0 ||
                canvas.height === 0) {
                continue;
            }
            const layerCtx = canvas.getContext('2d');
            const layerRc = new RoughCanvas(layerCtx.canvas);
            layerCtx.clearRect(0, 0, canvas.width, canvas.height);
            layerCtx.save();
            layerCtx.setTransform(matrix);
            this._renderByBound(layerCtx, matrix, layerRc, resolvedLayerRenderBound, layer.elements, false, renderStats);
        }
        if (fullRender || this._mainCanvasDirty) {
            allCanvasLayers.forEach((layer, idx) => {
                if (bypassStackingCanvases ||
                    !this._stackingCanvas[idx] ||
                    this._stackingCanvas[idx].width === 0 ||
                    this._stackingCanvas[idx].height === 0) {
                    fallbackElement = fallbackElement.concat(layer.elements);
                }
            });
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.save();
            ctx.setTransform(matrix);
            this._renderByBound(ctx, matrix, new RoughCanvas(ctx.canvas), mainCanvasRenderBound, fallbackElement, true, renderStats, mainCanvasCullBound);
        }
        const canvasMemorySnapshots = this._getCanvasMemorySnapshots();
        const canvasMemoryBytes = canvasMemorySnapshots.reduce((sum, snapshot) => sum + snapshot.bytes, 0);
        const layerTypes = this.layerManager.layers.map(layer => layer.type);
        const renderDurationMs = performance.now() - renderStart;
        this._debugMetrics.renderCount += 1;
        this._debugMetrics.totalRenderDurationMs += renderDurationMs;
        this._debugMetrics.lastRenderDurationMs = renderDurationMs;
        this._debugMetrics.maxRenderDurationMs = Math.max(this._debugMetrics.maxRenderDurationMs, renderDurationMs);
        this._debugMetrics.lastRenderMetrics = renderStats;
        this._debugMetrics.fallbackElementCount = fallbackElement.length;
        this._debugMetrics.dirtyLayerRenderCount = stackingIndexesToRender.length;
        this._lastDebugSnapshot = {
            canvasMemorySnapshots,
            canvasMemoryBytes,
            canvasPixelCount: canvasMemorySnapshots.reduce((sum, snapshot) => sum + snapshot.width * snapshot.height, 0),
            stackingCanvasCount: this._stackingCanvas.length,
            canvasLayerCount: layerTypes.filter(type => type === 'canvas').length,
            totalLayerCount: layerTypes.length,
            pooledStackingCanvasCount: this._stackingCanvasPool.length,
            visibleStackingCanvasCount: this._stackingCanvas.filter(canvas => canvas.width > 0 && canvas.height > 0).length,
        };
        this._needsFullRender = false;
        this._mainCanvasDirty = false;
        this._dirtyStackingCanvasIndexes.clear();
    }
    _renderByBound(ctx, matrix, rc, bound, surfaceElements, overLay = false, renderStats, cullBound = bound) {
        if (!ctx)
            return;
        renderStats && (renderStats.renderByBoundCallCount += 1);
        const elements = surfaceElements ??
            this.grid.search(cullBound, {
                filter: ['canvas', 'local'],
            });
        for (const element of elements) {
            const display = (element.display ?? true) && !element.hidden;
            if (display && intersects(getBoundWithRotation(element), cullBound)) {
                renderStats && (renderStats.visibleElementCount += 1);
                if (this.usePlaceholder &&
                    !element.forceFullRender) {
                    renderStats && (renderStats.placeholderElementCount += 1);
                    ctx.save();
                    ctx.fillStyle = resolveSurfacePlaceholderColor(this.getColorScheme());
                    const drawX = element.x - bound.x;
                    const drawY = element.y - bound.y;
                    ctx.fillRect(drawX, drawY, element.w, element.h);
                    ctx.restore();
                }
                else {
                    renderStats && (renderStats.renderedElementCount += 1);
                    ctx.save();
                    const renderFn = this.std.getOptional(ElementRendererIdentifier(element.type));
                    if (!renderFn)
                        continue;
                    ctx.globalAlpha = element.opacity ?? 1;
                    const dx = element.x - bound.x;
                    const dy = element.y - bound.y;
                    renderFn(element, ctx, matrix.translate(dx, dy), this, rc, bound);
                    ctx.restore();
                }
            }
        }
        if (overLay) {
            renderStats && (renderStats.overlayCount += this._overlays.size);
            for (const overlay of this._overlays) {
                ctx.save();
                ctx.translate(-bound.x, -bound.y);
                overlay.render(ctx, rc);
                ctx.restore();
            }
        }
        ctx.restore();
    }
    _resetSize() {
        const sizeUpdater = this._canvasSizeUpdater(this.viewport.overscanViewportBounds);
        sizeUpdater.update(this.canvas);
        this._lastCanvasBudgetZoom = this.viewport.zoom;
        this._invalidate({ type: 'all' });
    }
    _watchSurface(surfaceModel) {
        this._disposables.add(surfaceModel.elementAdded.subscribe(() => this.refresh({ type: 'all' })));
        this._disposables.add(surfaceModel.elementRemoved.subscribe(() => this.refresh({ type: 'all' })));
        this._disposables.add(surfaceModel.localElementAdded.subscribe(() => this.refresh({ type: 'all' })));
        this._disposables.add(surfaceModel.localElementDeleted.subscribe(() => this.refresh({ type: 'all' })));
        this._disposables.add(surfaceModel.localElementUpdated.subscribe(({ model }) => {
            this.refresh({ type: 'element', element: model });
        }));
        this._disposables.add(surfaceModel.elementUpdated.subscribe(payload => {
            // ignore externalXYWH update cause it's updated by the renderer
            if (payload.props['externalXYWH'])
                return;
            const element = surfaceModel.getElementById(payload.id);
            this.refresh(element ? { type: 'element', element } : { type: 'all' });
        }));
    }
    addOverlay(overlay) {
        overlay.setRenderer(this);
        this._overlays.add(overlay);
        this.refresh({ type: 'main' });
    }
    /**
     * Used to attach main canvas, main canvas will always exist
     * @param container
     */
    attach(container) {
        this._container = container;
        container.append(this.canvas);
        this._updatePlaceholderMode();
        this._resetSize();
        this.refresh({ type: 'all' });
    }
    dispose() {
        this._overlays.forEach(overlay => overlay.dispose());
        this._overlays.clear();
        this._disposables.dispose();
    }
    generateColorProperty(color, fallback) {
        return (this.provider.generateColorProperty?.(color, fallback) ?? 'transparent');
    }
    getCanvasByBound(bound = this.viewport.viewportBounds, surfaceElements, canvas, clearBeforeDrawing, withZoom) {
        canvas = canvas || document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        const actualWidth = Math.ceil(bound.w * dpr);
        const actualHeight = Math.ceil(bound.h * dpr);
        if (canvas.width !== actualWidth)
            canvas.width = actualWidth;
        if (canvas.height !== actualHeight)
            canvas.height = actualHeight;
        canvas.style.width = `${bound.w}px`;
        canvas.style.height = `${bound.h}px`;
        const ctx = canvas.getContext('2d');
        const matrix = new DOMMatrix().scaleSelf(withZoom ? dpr * this.viewport.zoom : dpr);
        const rc = new RoughCanvas(canvas);
        if (clearBeforeDrawing)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(matrix);
        this._renderByBound(ctx, matrix, rc, bound, surfaceElements);
        return canvas;
    }
    getColorScheme() {
        return this.provider.getColorScheme?.() ?? ColorScheme.Light;
    }
    getColorValue(color, fallback, real) {
        return (this.provider.getColorValue?.(color, fallback, real) ?? 'transparent');
    }
    getPropertyValue(property) {
        return this.provider.getPropertyValue?.(property) ?? '';
    }
    getDebugMetrics() {
        return {
            ...this._debugMetrics,
            ...this._lastDebugSnapshot,
            canvasMemoryMegabytes: this._lastDebugSnapshot.canvasMemoryBytes / 1024 / 1024,
        };
    }
    resetDebugMetrics() {
        this._debugMetrics = {
            refreshCount: 0,
            coalescedRefreshCount: 0,
            renderCount: 0,
            totalRenderDurationMs: 0,
            lastRenderDurationMs: 0,
            maxRenderDurationMs: 0,
            lastRenderMetrics: this._createRenderPassStats(),
            dirtyLayerRenderCount: 0,
            fallbackElementCount: 0,
        };
        this._lastDebugSnapshot = {
            canvasMemoryBytes: 0,
            canvasMemorySnapshots: [],
            canvasPixelCount: 0,
            canvasLayerCount: 0,
            pooledStackingCanvasCount: 0,
            stackingCanvasCount: 0,
            totalLayerCount: 0,
            visibleStackingCanvasCount: 0,
        };
    }
    refresh(target = { type: 'all' }) {
        this._debugMetrics.refreshCount += 1;
        this._invalidate(target);
        if (this._refreshRafId !== null) {
            this._debugMetrics.coalescedRefreshCount += 1;
            return;
        }
        this._refreshRafId = requestConnectedFrame(() => {
            this._refreshRafId = null;
            this._render();
        }, this._container);
    }
    removeOverlay(overlay) {
        if (!this._overlays.has(overlay)) {
            return;
        }
        overlay.setRenderer(null);
        this._overlays.delete(overlay);
        this.refresh({ type: 'main' });
    }
}
