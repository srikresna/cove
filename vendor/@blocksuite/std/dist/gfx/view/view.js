import { createIdentifier } from '@blocksuite/global/di';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import {} from '@blocksuite/global/gfx';
import { GfxPrimitiveElementModel } from '../model/surface/element-model.js';
export const GfxElementModelViewExtIdentifier = createIdentifier('GfxElementModelView');
export class GfxElementModelView {
    get isConnected() {
        return this._isConnected;
    }
    get rotate() {
        return this.model.rotate;
    }
    get surface() {
        return this.model.surface;
    }
    get type() {
        return this.model.type;
    }
    get std() {
        return this.gfx.std;
    }
    constructor(model, gfx) {
        this.gfx = gfx;
        this._handlers = new Map();
        this._isConnected = true;
        this.disposable = new DisposableGroup();
        this.model = model;
    }
    static setup(di) {
        if (!this.type) {
            throw new BlockSuiteError(ErrorCode.ValueNotExists, 'The GfxElementModelView should have a static `type` property.');
        }
        di.addImpl(GfxElementModelViewExtIdentifier(this.type), () => this);
    }
    containsBound(bounds) {
        return this.model.containsBound(bounds);
    }
    /**
     * Dispatches an event to the view.
     * @param event
     * @param evt
     * @returns Whether the event view has any handlers for the event.
     */
    dispatch(event, evt) {
        const handlers = this._handlers.get(event);
        if (handlers?.length) {
            handlers.forEach(callback => callback(evt));
            return true;
        }
        return false;
    }
    getLineIntersections(start, end) {
        return this.model.getLineIntersections(start, end);
    }
    getNearestPoint(point) {
        return this.model.getNearestPoint(point);
    }
    getRelativePointLocation(relativePoint) {
        return this.model.getRelativePointLocation(relativePoint);
    }
    includesPoint(x, y, _, __) {
        return this.model.includesPoint(x, y, _, __);
    }
    intersectsBound(bound) {
        return (this.containsBound(bound) ||
            bound.points.some((point, i, points) => this.getLineIntersections(point, points[(i + 1) % points.length])));
    }
    off(event, callback) {
        if (!this._handlers.has(event)) {
            return;
        }
        const callbacks = this._handlers.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }
    on(event, callback) {
        if (!this._handlers.has(event)) {
            this._handlers.set(event, []);
        }
        this._handlers.get(event).push(callback);
        return () => this.off(event, callback);
    }
    once(event, callback) {
        const off = this.on(event, evt => {
            off();
            callback(evt);
        });
        return off;
    }
    onCreated() { }
    onDragStart(_) {
        if (this.model instanceof GfxPrimitiveElementModel) {
            this.model.stash('xywh');
        }
    }
    onDragEnd(_) {
        if (this.model instanceof GfxPrimitiveElementModel) {
            this.model.pop('xywh');
        }
    }
    onDragMove({ dx, dy, currentBound }) {
        this.model.xywh = currentBound.moveDelta(dx, dy).serialize();
    }
    onBoxSelected(_) { }
    /**
     * Called when the view is destroyed.
     * Override this method requires calling `super.onDestroyed()`.
     */
    onDestroyed() {
        this._isConnected = false;
        this.disposable.dispose();
        this._handlers.clear();
    }
    render(_) { }
}
