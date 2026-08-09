import { EdgelessCRUDIdentifier, Overlay, } from '@blocksuite/affine-block-surface';
import { isTopLevelBlock } from '@blocksuite/affine-shared/utils';
import { Bound, getStroke, getSvgPathFromStroke, linePolygonIntersects, } from '@blocksuite/global/gfx';
import { BaseTool } from '@blocksuite/std/gfx';
class EraserOverlay extends Overlay {
    constructor() {
        super(...arguments);
        this.d = '';
    }
    render(ctx) {
        ctx.globalAlpha = 0.33;
        const path = new Path2D(this.d);
        ctx.fillStyle = '#aaa';
        ctx.fill(path);
    }
}
export class EraserTool extends BaseTool {
    constructor() {
        super(...arguments);
        this._erasable = new Set();
        this._eraserPoints = [];
        this._eraseTargets = new Set();
        this._loop = () => {
            const now = Date.now();
            const elapsed = now - this._timestamp;
            let didUpdate = false;
            if (this._prevEraserPoint !== this._prevPoint) {
                didUpdate = true;
                this._eraserPoints.push(this._prevPoint);
                this._prevEraserPoint = this._prevPoint;
            }
            if (elapsed > 32 && this._eraserPoints.length > 1) {
                didUpdate = true;
                this._eraserPoints.splice(0, Math.ceil(this._eraserPoints.length * 0.1));
                this._timestamp = now;
            }
            if (didUpdate) {
                const zoom = this.gfx.viewport.zoom;
                const d = getSvgPathFromStroke(getStroke(this._eraserPoints, {
                    size: 16 / zoom,
                    start: { taper: true },
                }));
                this._overlay.d = d;
                this._surfaceComponent?.refresh();
            }
            this._timer = requestAnimationFrame(this._loop);
        };
        this._overlay = new EraserOverlay(this.gfx);
        this._prevEraserPoint = [0, 0];
        this._prevPoint = [0, 0];
        this._timer = 0;
        this._timestamp = 0;
    }
    static { this.toolName = 'eraser'; }
    get _surfaceComponent() {
        return this.gfx.surfaceComponent;
    }
    _reset() {
        cancelAnimationFrame(this._timer);
        if (!this.gfx.surface) {
            return;
        }
        this._surfaceComponent?.renderer.removeOverlay(this._overlay);
        this._erasable.clear();
        this._eraseTargets.clear();
    }
    activate() {
        this._eraseTargets.forEach(erasable => {
            if (isTopLevelBlock(erasable)) {
                const ele = this.std.view.getBlock(erasable.id);
                ele && (ele.style.opacity = '1');
            }
            else {
                erasable.opacity = 1;
            }
        });
        this._reset();
    }
    dragEnd(_) {
        this.gfx.std
            .get(EdgelessCRUDIdentifier)
            .deleteElements(Array.from(this._eraseTargets));
        this._reset();
        this.doc.captureSync();
    }
    dragMove(e) {
        const currentPoint = this.gfx.viewport.toModelCoord(e.point.x, e.point.y);
        this._erasable.forEach(erasable => {
            if (erasable.isLocked())
                return;
            if (this._eraseTargets.has(erasable))
                return;
            if (isTopLevelBlock(erasable)) {
                const bound = Bound.deserialize(erasable.xywh);
                if (linePolygonIntersects(this._prevPoint, currentPoint, bound.points)) {
                    this._eraseTargets.add(erasable);
                    const ele = this.std.view.getBlock(erasable.id);
                    ele && (ele.style.opacity = '0.3');
                }
            }
            else {
                if (erasable.getLineIntersections(this._prevPoint, currentPoint)) {
                    this._eraseTargets.add(erasable);
                    erasable.opacity = 0.3;
                }
            }
        });
        this._prevPoint = currentPoint;
    }
    dragStart(e) {
        this.doc.captureSync();
        const { point } = e;
        const [x, y] = this.gfx.viewport.toModelCoord(point.x, point.y);
        this._eraserPoints = [[x, y]];
        this._prevPoint = [x, y];
        this._erasable = new Set([
            ...this.gfx.layer.canvasElements,
            ...this.gfx.layer.blocks,
        ]);
        this._loop();
        this._surfaceComponent?.renderer.addOverlay(this._overlay);
    }
}
