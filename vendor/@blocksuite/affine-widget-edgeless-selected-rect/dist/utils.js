import { EdgelessCRUDIdentifier, Overlay, } from '@blocksuite/affine-block-surface';
import { ShapeFactory } from '@blocksuite/affine-gfx-shape';
import { getShapeRadius, getShapeType, GroupElementModel, ShapeElementModel, } from '@blocksuite/affine-model';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Bound, normalizeDegAngle } from '@blocksuite/global/gfx';
import { assertType } from '@blocksuite/global/utils';
import * as Y from 'yjs';
export var Direction;
(function (Direction) {
    Direction[Direction["Right"] = 0] = "Right";
    Direction[Direction["Bottom"] = 1] = "Bottom";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Top"] = 3] = "Top";
})(Direction || (Direction = {}));
export const PANEL_WIDTH = 136;
export const PANEL_HEIGHT = 108;
export const MAIN_GAP = 100;
export const SECOND_GAP = 20;
export const DEFAULT_NOTE_OVERLAY_HEIGHT = 110;
export const DEFAULT_TEXT_WIDTH = 116;
export const DEFAULT_TEXT_HEIGHT = 24;
class AutoCompleteTargetOverlay extends Overlay {
    constructor(gfx, xywh) {
        super(gfx);
        this.xywh = xywh;
    }
    render(_ctx, _rc) { }
}
export class AutoCompleteTextOverlay extends AutoCompleteTargetOverlay {
    constructor(gfx, xywh) {
        super(gfx, xywh);
    }
    render(ctx, _rc) {
        const [x, y, w, h] = this.xywh;
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#1e96eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        // fill text placeholder
        ctx.font = '15px sans-serif';
        ctx.fillStyle = '#C0BFC1';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Type '/' to insert", x + w / 2, y + h / 2);
    }
}
export class AutoCompleteNoteOverlay extends AutoCompleteTargetOverlay {
    constructor(gfx, xywh, background) {
        super(gfx, xywh);
        this._background = background;
    }
    render(ctx, _rc) {
        const [x, y, w, h] = this.xywh;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = this._background;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // fill text placeholder
        ctx.font = '15px sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText("Type '/' for command", x + 24, y + h / 2);
    }
}
export class AutoCompleteFrameOverlay extends AutoCompleteTargetOverlay {
    constructor(gfx, xywh, strokeColor) {
        super(gfx, xywh);
        this._strokeColor = strokeColor;
    }
    render(ctx, _rc) {
        const [x, y, w, h] = this.xywh;
        // frame title background
        const titleWidth = 72;
        const titleHeight = 30;
        const titleY = y - titleHeight - 10;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x, titleY, titleWidth, titleHeight, 4);
        ctx.closePath();
        ctx.fill();
        // fill title text
        ctx.globalAlpha = 1;
        ctx.font = '14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Frame', x + titleWidth / 2, titleY + titleHeight / 2);
        // frame stroke
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = this._strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.closePath();
        ctx.stroke();
    }
}
export class AutoCompleteShapeOverlay extends Overlay {
    constructor(gfx, xywh, type, options, shapeStyle) {
        super(gfx);
        this._shape = ShapeFactory.createShape(xywh, type, options, shapeStyle);
    }
    render(ctx, rc) {
        ctx.globalAlpha = 0.4;
        this._shape.draw(ctx, rc);
    }
}
export function nextBound(type, curShape, elements) {
    const bound = Bound.deserialize(curShape.xywh);
    const { x, y, w, h } = bound;
    let nextBound;
    let angle = 0;
    switch (type) {
        case Direction.Right:
            angle = 0;
            break;
        case Direction.Bottom:
            angle = 90;
            break;
        case Direction.Left:
            angle = 180;
            break;
        case Direction.Top:
            angle = 270;
            break;
    }
    angle = normalizeDegAngle(angle + curShape.rotate);
    if (angle >= 45 && angle <= 135) {
        nextBound = new Bound(x, y + h + MAIN_GAP, w, h);
    }
    else if (angle >= 135 && angle <= 225) {
        nextBound = new Bound(x - w - MAIN_GAP, y, w, h);
    }
    else if (angle >= 225 && angle <= 315) {
        nextBound = new Bound(x, y - h - MAIN_GAP, w, h);
    }
    else {
        nextBound = new Bound(x + w + MAIN_GAP, y, w, h);
    }
    function isValidBound(bound) {
        return !elements.some(a => bound.isOverlapWithBound(a.elementBound));
    }
    let count = 0;
    function findValidBound() {
        count++;
        const number = Math.ceil(count / 2);
        const next = nextBound.clone();
        switch (type) {
            case Direction.Right:
            case Direction.Left:
                next.y =
                    count % 2 === 1
                        ? nextBound.y - (h + SECOND_GAP) * number
                        : nextBound.y + (h + SECOND_GAP) * number;
                break;
            case Direction.Bottom:
            case Direction.Top:
                next.x =
                    count % 2 === 1
                        ? nextBound.x - (w + SECOND_GAP) * number
                        : nextBound.x + (w + SECOND_GAP) * number;
                break;
        }
        if (isValidBound(next))
            return next;
        return findValidBound();
    }
    return isValidBound(nextBound) ? nextBound : findValidBound();
}
export function getPosition(type) {
    let startPosition;
    let endPosition;
    switch (type) {
        case Direction.Right:
            startPosition = [1, 0.5];
            endPosition = [0, 0.5];
            break;
        case Direction.Bottom:
            startPosition = [0.5, 1];
            endPosition = [0.5, 0];
            break;
        case Direction.Left:
            startPosition = [0, 0.5];
            endPosition = [1, 0.5];
            break;
        case Direction.Top:
            startPosition = [0.5, 0];
            endPosition = [0.5, 1];
            break;
    }
    return { startPosition, endPosition };
}
export function isShape(element) {
    return element instanceof ShapeElementModel;
}
export function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
export function createEdgelessElement(edgeless, current, bound) {
    const crud = edgeless.std.get(EdgelessCRUDIdentifier);
    let id;
    let element = null;
    if (isShape(current)) {
        id = crud.addElement(current.type, {
            ...current.serialize(),
            text: new Y.Text(),
            xywh: bound.serialize(),
        });
        if (!id)
            return null;
        element = crud.getElementById(id);
    }
    else {
        const { store } = edgeless;
        id = store.addBlock('affine:note', {
            background: current.props.background,
            displayMode: current.props.displayMode,
            edgeless: current.props.edgeless,
            xywh: bound.serialize(),
        }, edgeless.model.id);
        const note = store.getBlock(id)?.model;
        if (!note) {
            throw new BlockSuiteError(ErrorCode.GfxBlockElementError, 'Note block is not found after creation');
        }
        assertType(note);
        store.updateBlock(note, () => {
            note.props.edgeless.collapse = true;
        });
        store.addBlock('affine:paragraph', {}, note.id);
        element = note;
    }
    if (!element) {
        throw new BlockSuiteError(ErrorCode.GfxBlockElementError, 'Element is not found after creation');
    }
    const group = current.group;
    if (group instanceof GroupElementModel) {
        group.addChild(element);
    }
    return id;
}
export function createShapeElement(edgeless, current, targetType) {
    const crud = edgeless.std.get(EdgelessCRUDIdentifier);
    const id = crud.addElement('shape', {
        shapeType: getShapeType(targetType),
        radius: getShapeRadius(targetType),
        text: new Y.Text(),
    });
    if (!id)
        return null;
    const element = crud.getElementById(id);
    const group = current.group;
    if (group instanceof GroupElementModel && element) {
        group.addChild(element);
    }
    return id;
}
const rotateCursorMap = {
    'top-right': 0,
    'bottom-right': 90,
    'bottom-left': 180,
    'top-left': 270,
    // not used
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
export function generateCursorUrl(angle = 0, handle, fallback = 'default') {
    angle = ((angle % 360) + 360) % 360;
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cg transform='rotate(${rotateCursorMap[handle] + angle} 16 16)'%3E%3Cpath fill='white' d='M13.7,18.5h3.9l0-1.5c0-1.4-1.2-2.6-2.6-2.6h-1.5v3.9l-5.8-5.8l5.8-5.8v3.9h2.3c3.1,0,5.6,2.5,5.6,5.6v2.3h3.9l-5.8,5.8L13.7,18.5z'/%3E%3Cpath d='M20.4,19.4v-3.2c0-2.6-2.1-4.7-4.7-4.7h-3.2l0,0V9L9,12.6l3.6,3.6v-2.6l0,0H15c1.9,0,3.5,1.6,3.5,3.5v2.4l0,0h-2.6l3.6,3.6l3.6-3.6L20.4,19.4L20.4,19.4z'/%3E%3C/g%3E%3C/svg%3E") 16 16, ${fallback}`;
}
const handleToRotateMap = {
    'top-left': 45,
    'top-right': 135,
    'bottom-right': 45,
    'bottom-left': 135,
    left: 0,
    right: 0,
    top: 90,
    bottom: 90,
};
const rotateToHandleMap = {
    0: 'ew-resize',
    45: 'nwse-resize',
    90: 'ns-resize',
    135: 'nesw-resize',
};
export function getRotatedResizeCursor(option) {
    const angle = (Math.round((handleToRotateMap[option.handle] + ((option.angle + 360) % 360)) / 45) %
        4) *
        45;
    return rotateToHandleMap[angle] || 'default';
}
