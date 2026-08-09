import { Bound, getCommonBoundWithRotation, } from '@blocksuite/global/gfx';
export const DEFAULT_HANDLES = [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
    'left',
    'right',
    'top',
    'bottom',
];
export class ResizeController {
    get host() {
        return this.gfx.std.host;
    }
    constructor(option) {
        this.gfx = option.gfx;
    }
    getCoordsTransform(originalBound, handle) {
        const { x: xSign, y: ySign } = this.getHandleSign(handle);
        const pivot = new DOMPoint(originalBound.x + ((-xSign + 1) / 2) * originalBound.w, originalBound.y + ((-ySign + 1) / 2) * originalBound.h);
        const toLocalM = new DOMMatrix().translate(-pivot.x, -pivot.y);
        const toLocalRotatedM = new DOMMatrix()
            .translate(-pivot.x, -pivot.y)
            .translate(originalBound.w / 2 + originalBound.x, originalBound.h / 2 + originalBound.y)
            .rotate(-(originalBound.rotate ?? 0))
            .translate(-(originalBound.w / 2 + originalBound.x), -(originalBound.h / 2 + originalBound.y));
        const toLocal = (p, withRotation = false) => p.matrixTransform(withRotation ? toLocalRotatedM : toLocalM);
        const toModel = (p) => p.matrixTransform(toLocalRotatedM.inverse());
        const handlePos = toModel(new DOMPoint(originalBound.w * xSign, originalBound.h * ySign));
        return {
            xSign,
            ySign,
            originalBound,
            toLocalM,
            toLocalRotatedM,
            toLocal,
            toModel,
            handlePos: [handlePos.x, handlePos.y],
        };
    }
    getScaleFromDelta(transform, delta, handleStartPos, lockRatio) {
        const { originalBound, xSign, ySign, toModel, toLocal } = transform;
        const currentPos = toLocal(new DOMPoint(handleStartPos[0] + delta.dx, handleStartPos[1] + delta.dy), true);
        let scaleX = xSign ? currentPos.x / (originalBound.w * xSign) : 1;
        let scaleY = ySign ? currentPos.y / (originalBound.h * ySign) : 1;
        if (lockRatio) {
            const min = Math.min(Math.abs(scaleX), Math.abs(scaleY));
            scaleX = Math.sign(scaleX) * min;
            scaleY = Math.sign(scaleY) * min;
        }
        const finalHandlePos = toModel(new DOMPoint(originalBound.w * xSign * scaleX, originalBound.h * ySign * scaleY));
        return {
            scaleX,
            scaleY,
            handlePos: [finalHandlePos.x, finalHandlePos.y],
        };
    }
    getScaleMatrix({ scaleX, scaleY }, lockRatio) {
        if (lockRatio) {
            const min = Math.min(Math.abs(scaleX), Math.abs(scaleY));
            scaleX = Math.sign(scaleX) * min;
            scaleY = Math.sign(scaleY) * min;
        }
        return {
            scaleX,
            scaleY,
            scaleM: new DOMMatrix().scaleSelf(scaleX, scaleY),
        };
    }
    startResize(options) {
        const { elements, handle, onResizeStart, onResizeMove, onResizeUpdate, onResizeEnd, event, } = options;
        const originals = elements.map(el => ({
            x: el.x,
            y: el.y,
            w: el.w,
            h: el.h,
            rotate: el.rotate,
        }));
        const originalBound = originals.length > 1
            ? getCommonBoundWithRotation(originals)
            : {
                x: originals[0].x,
                y: originals[0].y,
                w: originals[0].w,
                h: originals[0].h,
                rotate: originals[0].rotate,
            };
        const startPt = this.gfx.viewport.toModelCoordFromClientCoord([
            event.clientX,
            event.clientY,
        ]);
        const transform = this.getCoordsTransform(originalBound, handle);
        const handleSign = {
            x: transform.xSign,
            y: transform.ySign,
        };
        const onPointerMove = (e) => {
            const currPt = this.gfx.viewport.toModelCoordFromClientCoord([
                e.clientX,
                e.clientY,
            ]);
            let delta = {
                dx: currPt[0] - startPt[0],
                dy: currPt[1] - startPt[1],
            };
            const shouldLockRatio = options.lockRatio || e.shiftKey || elements.length > 1;
            const { scaleX, scaleY, handlePos: currentHandlePos, } = this.getScaleFromDelta(transform, delta, transform.handlePos, shouldLockRatio);
            const scale = onResizeMove({
                scaleX,
                scaleY,
                originalBound,
                handleSign,
                handlePos: transform.handlePos,
                currentHandlePos,
                lockRatio: shouldLockRatio,
            });
            const scaleInfo = this.getScaleMatrix(scale, shouldLockRatio);
            if (elements.length === 1) {
                this.resizeSingle(originals[0], elements[0], shouldLockRatio, transform, scaleInfo, onResizeUpdate);
            }
            else {
                this.resizeMulti(originals, elements, transform, scaleInfo, onResizeUpdate);
            }
        };
        onResizeStart?.({
            handleSign,
            handlePos: transform.handlePos,
            data: elements.map(model => ({ model })),
        });
        const onPointerUp = () => {
            this.host.removeEventListener('pointermove', onPointerMove);
            this.host.removeEventListener('pointerup', onPointerUp);
            onResizeEnd?.({
                handleSign,
                handlePos: transform.handlePos,
                data: elements.map(model => ({ model })),
            });
        };
        this.host.addEventListener('pointermove', onPointerMove);
        this.host.addEventListener('pointerup', onPointerUp);
    }
    resizeSingle(orig, model, lockRatio, transform, scale, updateCallback) {
        const { toLocalM, toLocalRotatedM, toLocal, toModel } = transform;
        const { scaleX, scaleY, scaleM } = scale;
        const [visualTopLeft, visualBottomRight] = [
            new DOMPoint(orig.x, orig.y),
            new DOMPoint(orig.x + orig.w, orig.y + orig.h),
        ].map(p => {
            const localP = toLocal(p, false);
            const scaledP = localP.matrixTransform(scaleM);
            return toModel(scaledP);
        });
        const center = {
            x: Math.min(visualTopLeft.x, visualBottomRight.x) +
                Math.abs(visualBottomRight.x - visualTopLeft.x) / 2,
            y: Math.min(visualTopLeft.y, visualBottomRight.y) +
                Math.abs(visualBottomRight.y - visualTopLeft.y) / 2,
        };
        const restoreM = new DOMMatrix()
            .translate(center.x, center.y)
            .rotate(-orig.rotate)
            .translate(-center.x, -center.y);
        // only used to provide the matrix information
        const finalM = restoreM
            .multiply(toLocalRotatedM.inverse())
            .multiply(scaleM)
            .multiply(toLocalM);
        const [topLeft, bottomRight] = [visualTopLeft, visualBottomRight].map(p => {
            return p.matrixTransform(restoreM);
        });
        updateCallback({
            lockRatio,
            scaleX,
            scaleY,
            data: [
                {
                    model: model,
                    originalBound: new Bound(orig.x, orig.y, orig.w, orig.h),
                    newBound: new Bound(Math.min(topLeft.x, bottomRight.x), Math.min(bottomRight.y, topLeft.y), Math.abs(bottomRight.x - topLeft.x), Math.abs(bottomRight.y - topLeft.y)),
                    lockRatio: lockRatio,
                    matrix: finalM,
                },
            ],
        });
    }
    resizeMulti(originals, elements, transform, scale, updateCallback) {
        const { toLocalM } = transform;
        const { scaleX, scaleY, scaleM } = scale;
        const data = elements.map((model, i) => {
            const orig = originals[i];
            const finalM = new DOMMatrix()
                .multiply(toLocalM.inverse())
                .multiply(scaleM)
                .multiply(toLocalM);
            const [topLeft, bottomRight] = [
                new DOMPoint(orig.x, orig.y),
                new DOMPoint(orig.x + orig.w, orig.y + orig.h),
            ].map(p => {
                return p.matrixTransform(finalM);
            });
            const newBound = new Bound(Math.min(topLeft.x, bottomRight.x), Math.min(bottomRight.y, topLeft.y), Math.abs(bottomRight.x - topLeft.x), Math.abs(bottomRight.y - topLeft.y));
            return {
                model,
                originalBound: new Bound(orig.x, orig.y, orig.w, orig.h),
                newBound,
                lockRatio: true,
                matrix: finalM,
            };
        });
        updateCallback({ lockRatio: true, scaleX, scaleY, data });
    }
    startRotate(option) {
        const { event, elements, onRotateUpdate } = option;
        const originals = elements.map(el => ({
            x: el.x,
            y: el.y,
            w: el.w,
            h: el.h,
            rotate: el.rotate,
        }));
        const startPt = this.gfx.viewport.toModelCoordFromClientCoord([
            event.clientX,
            event.clientY,
        ]);
        const onPointerMove = (e) => {
            const currentPt = this.gfx.viewport.toModelCoordFromClientCoord([
                e.clientX,
                e.clientY,
            ]);
            const snap = e.shiftKey;
            if (elements.length > 1) {
                this.rotateMulti({
                    origs: originals,
                    models: elements,
                    startPt,
                    currentPt,
                    snap,
                    onRotateUpdate,
                });
            }
            else {
                this.rotateSingle({
                    orig: originals[0],
                    model: elements[0],
                    startPt,
                    currentPt,
                    snap,
                    onRotateUpdate,
                });
            }
        };
        const onPointerUp = () => {
            this.host.removeEventListener('pointermove', onPointerMove);
            this.host.removeEventListener('pointerup', onPointerUp);
            this.host.removeEventListener('pointercancel', onPointerUp);
            option.onRotateEnd?.({ data: elements.map(model => ({ model })) });
        };
        option.onRotateStart?.({ data: elements.map(model => ({ model })) });
        this.host.addEventListener('pointermove', onPointerMove, false);
        this.host.addEventListener('pointerup', onPointerUp, false);
        this.host.addEventListener('pointercancel', onPointerUp, false);
    }
    getNormalizedAngle(y, x) {
        let angle = Math.atan2(y, x);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return (angle * 180) / Math.PI;
    }
    toNormalizedAngle(angle) {
        if (angle < 0) {
            angle += 360;
        }
        return Math.round(angle) % 360;
    }
    rotateSingle(option) {
        const { orig, model, startPt, currentPt, snap, onRotateUpdate } = option;
        const center = {
            x: orig.x + orig.w / 2,
            y: orig.y + orig.h / 2,
        };
        const toLocalM = new DOMMatrix().translate(-center.x, -center.y);
        const toLocal = (p) => p.matrixTransform(toLocalM);
        const v0 = toLocal(new DOMPoint(startPt[0], startPt[1])), v1 = toLocal(new DOMPoint(currentPt[0], currentPt[1]));
        const startAngle = this.getNormalizedAngle(v0.y, v0.x), endAngle = this.getNormalizedAngle(v1.y, v1.x);
        const deltaDeg = endAngle - startAngle;
        const rotatedAngle = orig.rotate + deltaDeg;
        const targetRotate = this.toNormalizedAngle(snap
            ? Math.round((rotatedAngle % 15) / 15) * 15 +
                Math.floor(rotatedAngle / 15) * 15
            : rotatedAngle);
        // only used to provide the matrix information
        const rotateM = new DOMMatrix()
            .translate(center.x, center.y)
            .rotate(targetRotate - orig.rotate)
            .translate(-center.x, -center.y);
        onRotateUpdate?.({
            delta: deltaDeg,
            data: [
                {
                    model,
                    originalBound: new Bound(orig.x, orig.y, orig.w, orig.h),
                    newBound: new Bound(orig.x, orig.y, orig.w, orig.h),
                    originalRotate: orig.rotate,
                    newRotate: targetRotate,
                    matrix: rotateM,
                },
            ],
        });
    }
    rotateMulti(option) {
        const { models, startPt, currentPt, onRotateUpdate } = option;
        const commonBound = getCommonBoundWithRotation(option.origs);
        const center = {
            x: commonBound.x + commonBound.w / 2,
            y: commonBound.y + commonBound.h / 2,
        };
        const toLocalM = new DOMMatrix().translate(-center.x, -center.y);
        const toLocal = (p) => p.matrixTransform(toLocalM);
        const v0 = toLocal(new DOMPoint(startPt[0], startPt[1])), v1 = toLocal(new DOMPoint(currentPt[0], currentPt[1]));
        const a0 = this.getNormalizedAngle(v0.y, v0.x), a1 = this.getNormalizedAngle(v1.y, v1.x);
        const deltaDeg = a1 - a0;
        const rotateM = new DOMMatrix()
            .translate(center.x, center.y)
            .rotate(deltaDeg)
            .translate(-center.x, -center.y);
        const toRotatedPoint = (p) => p.matrixTransform(rotateM);
        onRotateUpdate?.({
            delta: deltaDeg,
            data: models.map((model, index) => {
                const orig = option.origs[index];
                const center = {
                    x: orig.x + orig.w / 2,
                    y: orig.y + orig.h / 2,
                };
                const visualM = new DOMMatrix()
                    .translate(center.x, center.y)
                    .rotate(orig.rotate)
                    .translate(-center.x, -center.y);
                const toVisual = (p) => p.matrixTransform(visualM);
                const [rotatedVisualLeftTop, rotatedVisualBottomRight] = [
                    new DOMPoint(orig.x, orig.y),
                    new DOMPoint(orig.x + orig.w, orig.y + orig.h),
                ].map(p => toRotatedPoint(toVisual(p)));
                const newCenter = {
                    x: Math.min(rotatedVisualLeftTop.x, rotatedVisualBottomRight.x) +
                        Math.abs(rotatedVisualBottomRight.x - rotatedVisualLeftTop.x) / 2,
                    y: Math.min(rotatedVisualLeftTop.y, rotatedVisualBottomRight.y) +
                        Math.abs(rotatedVisualBottomRight.y - rotatedVisualLeftTop.y) / 2,
                };
                const newRotated = this.toNormalizedAngle(orig.rotate + deltaDeg);
                const finalM = new DOMMatrix()
                    .translate(newCenter.x, newCenter.y)
                    .rotate(-newRotated)
                    .translate(-newCenter.x, -newCenter.y)
                    .multiply(rotateM)
                    .multiply(visualM);
                const topLeft = rotatedVisualLeftTop.matrixTransform(new DOMMatrix()
                    .translate(newCenter.x, newCenter.y)
                    .rotate(-newRotated)
                    .translate(-newCenter.x, -newCenter.y));
                return {
                    model,
                    originalBound: new Bound(orig.x, orig.y, orig.w, orig.h),
                    newBound: new Bound(topLeft.x, topLeft.y, orig.w, orig.h),
                    originalRotate: orig.rotate,
                    newRotate: newRotated,
                    matrix: finalM,
                };
            }),
        });
    }
    getHandleSign(handle) {
        switch (handle) {
            case 'top-left':
                return { x: -1, y: -1 };
            case 'top':
                return { x: 0, y: -1 };
            case 'top-right':
                return { x: 1, y: -1 };
            case 'right':
                return { x: 1, y: 0 };
            case 'bottom-right':
                return { x: 1, y: 1 };
            case 'bottom':
                return { x: 0, y: 1 };
            case 'bottom-left':
                return { x: -1, y: 1 };
            case 'left':
                return { x: -1, y: 0 };
            default:
                return { x: 0, y: 0 };
        }
    }
}
