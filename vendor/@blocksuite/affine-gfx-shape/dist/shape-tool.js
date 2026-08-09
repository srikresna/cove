import { CanvasElementType, DefaultTool, EXCLUDING_MOUSE_OUT_CLASS_LIST, } from '@blocksuite/affine-block-surface';
import { DefaultTheme, getShapeType, ShapeType, } from '@blocksuite/affine-model';
import { EditPropsStore, TelemetryProvider, ThemeProvider, } from '@blocksuite/affine-shared/services';
import { hasClassNameInList } from '@blocksuite/affine-shared/utils';
import { Bound } from '@blocksuite/global/gfx';
import { BaseTool } from '@blocksuite/std/gfx';
import { effect } from '@preact/signals-core';
import { SHAPE_OVERLAY_HEIGHT, SHAPE_OVERLAY_OPTIONS, SHAPE_OVERLAY_WIDTH, } from './consts.js';
import { ShapeOverlay } from './overlay/shape-overlay.js';
export class ShapeTool extends BaseTool {
    static { this.toolName = 'shape'; }
    get _surfaceComponent() {
        return this.gfx.surfaceComponent;
    }
    _addNewShape(e, width, height) {
        const { viewport } = this.gfx;
        const { shapeName } = this.activatedOption;
        const attributes = this.std.get(EditPropsStore).lastProps$.value[`shape:${shapeName}`];
        if (shapeName === 'roundedRect') {
            width += 40;
        }
        // create a shape block when drag start
        const [modelX, modelY] = viewport.toModelCoord(e.point.x, e.point.y);
        const bound = new Bound(modelX, modelY, width, height);
        const id = this.gfx.surface.addElement({
            type: CanvasElementType.SHAPE,
            shapeType: getShapeType(shapeName),
            xywh: bound.serialize(),
            radius: attributes.radius,
        });
        this.std.getOptional(TelemetryProvider)?.track('CanvasElementAdded', {
            control: 'canvas:draw',
            page: 'whiteboard editor',
            module: 'toolbar',
            segment: 'toolbar',
            type: CanvasElementType.SHAPE,
            other: {
                shapeName,
            },
        });
        return id;
    }
    _hideOverlay() {
        if (!this._shapeOverlay)
            return;
        this._shapeOverlay.globalAlpha = 0;
        this._surfaceComponent?.refresh();
    }
    _resize(shiftPressed = false, spacePressed = false) {
        const { _draggingElement, _draggingElementId: id, controller } = this;
        if (!id || !_draggingElement)
            return;
        const draggingArea = this.controller.draggingArea$.peek();
        const { startX, startY } = draggingArea;
        let { endX, endY } = draggingArea;
        if (shiftPressed) {
            const w = Math.abs(endX - startX);
            const h = Math.abs(endY - startY);
            const m = Math.max(w, h);
            endX = startX + (endX > startX ? m : -m);
            endY = startY + (endY > startY ? m : -m);
        }
        if (spacePressed && this._spacePressedCtx) {
            const { w, h, startX, startY, endX: pressedX, endY: pressedY, } = this._spacePressedCtx.draggingArea;
            const { endX: lastX, endY: lastY } = controller.draggingArea$.peek();
            const dx = lastX - pressedX;
            const dy = lastY - pressedY;
            this.controller.draggingArea$.value = {
                x: Math.min(startX + dx, lastX),
                y: Math.min(startY + dy, lastY),
                w,
                h,
                endX: endX + dx,
                endY: endY + dy,
                startX: startX + dx,
                startY: startY + dy,
            };
        }
        const bound = new Bound(Math.min(startX, endX), Math.min(startY, endY), Math.abs(startX - endX), Math.abs(startY - endY));
        this.gfx.updateElement(_draggingElement, {
            xywh: bound.serialize(),
        });
    }
    _updateOverlayPosition(x, y) {
        if (!this._shapeOverlay)
            return;
        this._shapeOverlay.x = x;
        this._shapeOverlay.y = y;
        this._surfaceComponent?.refresh();
    }
    constructor(gfx) {
        super(gfx);
        this._disableOverlay = false;
        this._draggingElement = null;
        this._draggingElementId = null;
        // shape overlay
        this._shapeOverlay = null;
        this._spacePressedCtx = null;
        this.activatedOption = {
            shapeName: ShapeType.Rect,
        };
    }
    activate() {
        this.createOverlay();
    }
    clearOverlay() {
        if (!this._shapeOverlay)
            return;
        this._shapeOverlay.dispose();
        this._surfaceComponent?.renderer.removeOverlay(this._shapeOverlay);
        this._shapeOverlay = null;
        this._surfaceComponent?.renderer.refresh();
    }
    click(e) {
        this.clearOverlay();
        if (this._disableOverlay)
            return;
        this.doc.captureSync();
        const id = this._addNewShape(e, SHAPE_OVERLAY_WIDTH, SHAPE_OVERLAY_HEIGHT);
        const element = this.gfx.getElementById(id);
        if (!element)
            return;
        this.gfx.tool.setTool(DefaultTool);
        this.gfx.selection.set({
            elements: [element.id],
            editing: false,
        });
    }
    createOverlay() {
        this.clearOverlay();
        if (this._disableOverlay)
            return;
        const options = SHAPE_OVERLAY_OPTIONS;
        const { shapeName } = this.activatedOption;
        const attributes = this.std.get(EditPropsStore).lastProps$.value[`shape:${shapeName}`];
        options.stroke = this.std
            .get(ThemeProvider)
            .getColorValue(attributes.strokeColor, DefaultTheme.shapeStrokeColor, true);
        options.fill = this.std
            .get(ThemeProvider)
            .getColorValue(attributes.fillColor, DefaultTheme.shapeFillColor, true);
        switch (attributes.strokeStyle) {
            case 'dash':
                options.strokeLineDash = [12, 12];
                break;
            case 'none':
                options.strokeLineDash = [];
                options.stroke = 'transparent';
                break;
            default:
                options.strokeLineDash = [];
        }
        this._shapeOverlay = new ShapeOverlay(this.gfx, shapeName, options, {
            shapeStyle: attributes.shapeStyle,
            fillColor: attributes.fillColor,
            strokeColor: attributes.strokeColor,
        });
        this._surfaceComponent?.renderer.addOverlay(this._shapeOverlay);
    }
    deactivate() {
        this.clearOverlay();
    }
    dragEnd() {
        if (this._disableOverlay)
            return;
        if (this._draggingElement) {
            const draggingElement = this._draggingElement;
            draggingElement.pop('xywh');
        }
        const id = this._draggingElementId;
        if (!id)
            return;
        const draggingArea = this.controller.draggingArea$.peek();
        if (draggingArea.w < 20 && draggingArea.h < 20) {
            this.gfx.deleteElement(id);
            return;
        }
        this._draggingElement = null;
        this._draggingElementId = null;
        this.doc.captureSync();
        const element = this.gfx.getElementById(id);
        if (!element)
            return;
        this.controller.setTool(DefaultTool);
        this.gfx.selection.set({
            elements: [element.id],
        });
    }
    dragMove(e) {
        if (this._disableOverlay || !this._draggingElementId)
            return;
        this._resize(e.keys.shift || this.gfx.keyboard.shiftKey$.peek(), this.gfx.keyboard.spaceKey$.peek());
    }
    dragStart(e) {
        if (this._disableOverlay)
            return;
        this.clearOverlay();
        this.doc.captureSync();
        const id = this._addNewShape(e, 0, 0);
        this._spacePressedCtx = null;
        this._draggingElementId = id;
        this._draggingElement = this.gfx.getElementById(id);
        this._draggingElement.stash('xywh');
    }
    mounted() {
        this.disposable.add(effect(() => {
            const pressed = this.gfx.keyboard.shiftKey$.value;
            if (!this._draggingElementId || !this.activate) {
                return;
            }
            this._resize(pressed);
        }));
        this.disposable.add(effect(() => {
            const spacePressed = this.gfx.keyboard.spaceKey$.value;
            if (spacePressed && this._draggingElementId) {
                this._spacePressedCtx = {
                    draggingArea: this.controller.draggingArea$.peek(),
                };
            }
        }));
    }
    pointerMove(e) {
        if (!this._shapeOverlay)
            return;
        // shape options, like stroke color, fill color, etc.
        if (this._shapeOverlay.globalAlpha === 0)
            this._shapeOverlay.globalAlpha = 1;
        const [x, y] = this.gfx.viewport.toModelCoord(e.x, e.y);
        this._updateOverlayPosition(x, y);
    }
    pointerOut(e) {
        if (e.raw.relatedTarget &&
            hasClassNameInList(e.raw.relatedTarget, EXCLUDING_MOUSE_OUT_CLASS_LIST))
            return;
        this._hideOverlay();
    }
    setDisableOverlay(disable) {
        this._disableOverlay = disable;
    }
    cycleShapeName(dir = 'next') {
        const shapeNames = [
            ShapeType.Rect,
            ShapeType.Ellipse,
            ShapeType.Diamond,
            ShapeType.Triangle,
            'roundedRect',
        ];
        const currentIndex = shapeNames.indexOf(this.activatedOption.shapeName);
        const nextIndex = (currentIndex + (dir === 'prev' ? -1 : 1) + shapeNames.length) %
            shapeNames.length;
        return shapeNames[nextIndex];
    }
}
