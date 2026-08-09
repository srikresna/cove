import { Bound, type IBound, type IVec, PointLocation } from '@blocksuite/global/gfx';
import type { PointTestOptions } from '@blocksuite/std/gfx';
import type { ShapeElementModel } from '../shape.js';
export declare const ellipse: {
    points({ x, y, w, h }: IBound): IVec[];
    draw(ctx: CanvasRenderingContext2D, { x, y, w, h, rotate }: IBound): void;
    includesPoint(this: ShapeElementModel, x: number, y: number, options: PointTestOptions): boolean;
    containsBound(bounds: Bound, element: ShapeElementModel): boolean;
    getNearestPoint(point: IVec, { rotate, xywh }: ShapeElementModel): IVec;
    getLineIntersections(start: IVec, end: IVec, { rotate, xywh }: ShapeElementModel): PointLocation[] | null;
    getRelativePointLocation(relativePoint: IVec, { rotate, xywh }: ShapeElementModel): PointLocation;
};
//# sourceMappingURL=ellipse.d.ts.map