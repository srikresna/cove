import { Bound, type IBound, type IPoint, type IVec } from '@blocksuite/global/gfx';
import type { GfxController } from '../..';
import type { GfxModel } from '../../model/model';
export type ResizeHandle = 'top-left' | 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left';
export declare const DEFAULT_HANDLES: ResizeHandle[];
export interface OptionResize {
    elements: GfxModel[];
    handle: ResizeHandle;
    lockRatio: boolean;
    event: PointerEvent;
    onResizeMove: (payload: {
        scaleX: number;
        scaleY: number;
        originalBound: IBound;
        handleSign: IPoint;
        handlePos: IVec;
        currentHandlePos: IVec;
        lockRatio: boolean;
    }) => {
        scaleX: number;
        scaleY: number;
    };
    onResizeUpdate: (payload: {
        lockRatio: boolean;
        scaleX: number;
        scaleY: number;
        data: {
            model: GfxModel;
            originalBound: Bound;
            newBound: Bound;
            lockRatio: boolean;
            matrix: DOMMatrix;
        }[];
    }) => void;
    onResizeStart?: (payload: {
        handlePos: IVec;
        handleSign: IPoint;
        data: {
            model: GfxModel;
        }[];
    }) => void;
    onResizeEnd?: (payload: {
        handlePos: IVec;
        handleSign: IPoint;
        data: {
            model: GfxModel;
        }[];
    }) => void;
}
export type RotateOption = {
    elements: GfxModel[];
    event: PointerEvent;
    onRotateUpdate: (payload: {
        delta: number;
        data: {
            model: GfxModel;
            newBound: Bound;
            originalBound: Bound;
            originalRotate: number;
            newRotate: number;
            matrix: DOMMatrix;
        }[];
    }) => void;
    onRotateStart?: (payload: {
        data: {
            model: GfxModel;
        }[];
    }) => void;
    onRotateEnd?: (payload: {
        data: {
            model: GfxModel;
        }[];
    }) => void;
};
export declare class ResizeController {
    private readonly gfx;
    get host(): import("../../..").EditorHost;
    constructor(option: {
        gfx: GfxController;
    });
    getCoordsTransform(originalBound: IBound, handle: ResizeHandle): {
        xSign: number;
        ySign: number;
        originalBound: IBound;
        toLocalM: DOMMatrix;
        toLocalRotatedM: DOMMatrix;
        toLocal: (p: DOMPoint, withRotation?: boolean) => DOMPoint;
        toModel: (p: DOMPoint) => DOMPoint;
        handlePos: IVec;
    };
    getScaleFromDelta(transform: ReturnType<ResizeController['getCoordsTransform']>, delta: {
        dx: number;
        dy: number;
    }, handleStartPos: IVec, lockRatio: boolean): {
        scaleX: number;
        scaleY: number;
        handlePos: IVec;
    };
    getScaleMatrix({ scaleX, scaleY }: {
        scaleX: number;
        scaleY: number;
    }, lockRatio: boolean): {
        scaleX: number;
        scaleY: number;
        scaleM: DOMMatrix;
    };
    startResize(options: OptionResize): void;
    private resizeSingle;
    private resizeMulti;
    startRotate(option: RotateOption): void;
    private getNormalizedAngle;
    private toNormalizedAngle;
    private rotateSingle;
    private rotateMulti;
    private getHandleSign;
}
//# sourceMappingURL=manager.d.ts.map