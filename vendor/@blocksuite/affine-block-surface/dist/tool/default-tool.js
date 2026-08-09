import { resetNativeSelection } from '@blocksuite/affine-shared/utils';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { BaseTool, InteractivityIdentifier, isGfxGroupCompatibleModel, } from '@blocksuite/std/gfx';
import { effect } from '@preact/signals-core';
import { calPanDelta } from './panning-utils.js';
export var DefaultModeDragType;
(function (DefaultModeDragType) {
    /** Moving selected contents */
    DefaultModeDragType["ContentMoving"] = "content-moving";
    /** Native range dragging inside active note block */
    DefaultModeDragType["NativeEditing"] = "native-editing";
    /** Default void state */
    DefaultModeDragType["None"] = "none";
    /** Expanding the dragging area, select the content covered inside */
    DefaultModeDragType["Selecting"] = "selecting";
})(DefaultModeDragType || (DefaultModeDragType = {}));
export class DefaultTool extends BaseTool {
    constructor() {
        super(...arguments);
        this._edgeScrollingTimer = null;
        this._clearDisposable = () => {
            if (this._disposables) {
                this._disposables.dispose();
                this._disposables = null;
            }
        };
        this._clearSelectingState = () => {
            this._stopEdgeScrolling();
            this._clearDisposable();
        };
        this._disposables = null;
        this._spaceTranslationRect = null;
        this._enableEdgeScrolling = (delta) => {
            this._stopEdgeScrolling();
            this._scrollViewport(delta);
            this._edgeScrollingTimer = window.setInterval(() => {
                this._scrollViewport(delta);
            }, 30);
        };
        this._stopEdgeScrolling = () => {
            if (this._edgeScrollingTimer) {
                clearInterval(this._edgeScrollingTimer);
                this._edgeScrollingTimer = null;
            }
        };
        this._toBeMoved = [];
        this._updateSelection = () => {
            const { gfx } = this;
            if (gfx.keyboard.spaceKey$.peek() && this._spaceTranslationRect) {
                const { w, h, startX, startY, endX, endY } = this._spaceTranslationRect;
                const { endX: lastX, endY: lastY } = this.controller.draggingArea$.peek();
                const dx = lastX - endX;
                const dy = lastY - endY;
                this.controller.draggingArea$.value = {
                    x: Math.min(startX + dx, lastX),
                    y: Math.min(startY + dy, lastY),
                    w,
                    h,
                    startX: startX + dx,
                    startY: startY + dy,
                    endX: endX + dx,
                    endY: endY + dy,
                };
            }
            const elements = this.interactivity?.handleBoxSelection({
                box: this.controller.draggingArea$.peek(),
            });
            if (!elements)
                return;
            this.selection.set({
                elements: elements.map(el => el.id),
                editing: false,
            });
        };
        this.dragType = DefaultModeDragType.None;
        this.movementDragging = false;
    }
    static { this.toolName = 'default'; }
    _scrollViewport(delta) {
        this.gfx.viewport.applyDeltaCenter(delta[0], delta[1]);
    }
    /**
     * Get the end position of the dragging area in the model coordinate
     */
    get dragLastPos() {
        const { endX, endY } = this.controller.draggingArea$.peek();
        return [endX, endY];
    }
    /**
     * Get the start position of the dragging area in the model coordinate
     */
    get dragStartPos() {
        const { startX, startY } = this.controller.draggingArea$.peek();
        return [startX, startY];
    }
    get selection() {
        return this.gfx.selection;
    }
    get interactivity() {
        return this.std.getOptional(InteractivityIdentifier);
    }
    async _cloneContent() {
        const clonedResult = await this.interactivity?.requestElementClone({
            elements: this._toBeMoved,
        });
        if (!clonedResult)
            return;
        this._toBeMoved = clonedResult.elements;
        this.selection.set({
            elements: this._toBeMoved.map(e => e.id),
            editing: false,
        });
    }
    _determineDragType(evt) {
        const { x, y } = this.controller.lastMousePos$.peek();
        if (this.selection.isInSelectedRect(x, y)) {
            return this.selection.editing
                ? DefaultModeDragType.NativeEditing
                : DefaultModeDragType.ContentMoving;
        }
        else {
            const checked = this.interactivity?.handleElementSelection(evt);
            if (checked) {
                return DefaultModeDragType.ContentMoving;
            }
            else {
                return DefaultModeDragType.Selecting;
            }
        }
    }
    initializeDragState(dragType, event) {
        this.dragType = dragType;
        this._clearDisposable();
        this._disposables = new DisposableGroup();
        // If the drag type is selecting, set up the dragging area disposable group
        // If the viewport updates when dragging, should update the dragging area and selection
        if (this.dragType === DefaultModeDragType.Selecting) {
            this._disposables.add(this.gfx.viewport.viewportUpdated.subscribe(() => {
                if (this.dragType === DefaultModeDragType.Selecting &&
                    this.controller.dragging$.peek()) {
                    this._updateSelection();
                }
            }));
            return;
        }
        if (this.dragType === DefaultModeDragType.ContentMoving) {
            if (this.interactivity) {
                this.doc.captureSync();
                this.interactivity.handleElementMove({
                    movingElements: this._toBeMoved,
                    event: event.raw,
                    onDragEnd: () => {
                        this.doc.captureSync();
                    },
                });
            }
            return;
        }
    }
    click(e) {
        if (this.doc.readonly)
            return;
        if (!this.interactivity?.handleElementSelection(e)) {
            this.selection.clear();
            resetNativeSelection(null);
        }
        this.interactivity?.dispatchEvent('click', e);
    }
    deactivate() {
        this._stopEdgeScrolling();
        this._clearDisposable();
    }
    doubleClick(e) {
        if (this.doc.readonly) {
            const viewport = this.gfx.viewport;
            if (viewport.zoom === 1) {
                this.gfx.fitToScreen();
            }
            else {
                // Zoom to 100% and Center
                const [x, y] = viewport.toModelCoord(e.x, e.y);
                viewport.setViewport(1, [x, y], true);
            }
            return;
        }
        this.interactivity?.dispatchEvent('dblclick', e);
    }
    dragEnd(e) {
        this.interactivity?.dispatchEvent('dragend', e);
        if (this.selection.editing || !this.movementDragging)
            return;
        this.movementDragging = false;
        this._toBeMoved = [];
        this._clearSelectingState();
        this.dragType = DefaultModeDragType.None;
    }
    dragMove(e) {
        this.interactivity?.dispatchEvent('dragmove', e);
        if (!this.movementDragging) {
            return;
        }
        const { viewport } = this.gfx;
        switch (this.dragType) {
            case DefaultModeDragType.Selecting: {
                // Record the last drag pointer position for auto panning and view port updating
                this._updateSelection();
                const moveDelta = calPanDelta(viewport, e);
                if (moveDelta) {
                    this._enableEdgeScrolling(moveDelta);
                }
                else {
                    this._stopEdgeScrolling();
                }
                break;
            }
            case DefaultModeDragType.ContentMoving: {
                break;
            }
            case DefaultModeDragType.NativeEditing: {
                // TODO reset if drag out of note
                break;
            }
        }
    }
    // oxlint-disable-next-line @typescript-eslint/no-misused-promises
    async dragStart(e) {
        const { preventDefaultState, handledByView } = this.interactivity?.dispatchEvent('dragstart', e) ?? {};
        if (this.selection.editing || preventDefaultState || handledByView)
            return;
        this.movementDragging = true;
        // Determine the drag type based on the current state and event
        let dragType = this._determineDragType(e);
        const elements = this.selection.selectedElements;
        if (elements.some(e => e.isLocked()))
            return;
        const toBeMoved = new Set(elements);
        elements.forEach(element => {
            if (isGfxGroupCompatibleModel(element)) {
                element.descendantElements.forEach(ele => {
                    toBeMoved.add(ele);
                });
            }
        });
        this._toBeMoved = Array.from(toBeMoved);
        // If alt key is pressed and content is moving, clone the content
        if (dragType === DefaultModeDragType.ContentMoving && e.keys.alt) {
            await this._cloneContent();
        }
        // Set up drag state
        this.initializeDragState(dragType, e);
    }
    mounted() {
        this.disposable.add(effect(() => {
            const pressed = this.gfx.keyboard.spaceKey$.value;
            if (pressed) {
                const currentDraggingArea = this.controller.draggingArea$.peek();
                this._spaceTranslationRect = currentDraggingArea;
            }
            else {
                this._spaceTranslationRect = null;
            }
        }));
    }
    pointerDown(e) {
        this.interactivity?.dispatchEvent('pointerdown', e);
    }
    pointerMove(e) {
        this.interactivity?.dispatchEvent('pointermove', e);
    }
    pointerUp(e) {
        this.interactivity?.dispatchEvent('pointerup', e);
    }
    unmounted() { }
}
