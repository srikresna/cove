import { Bound, type IVec, type IVec3, PointLocation, type SerializedXYWH } from '@blocksuite/global/gfx';
import type { BaseElementProps, PointTestOptions } from '@blocksuite/std/gfx';
import { GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import { type Color } from '../../themes/index';
export type HighlighterProps = BaseElementProps & {
    /**
     * [[x0,y0,pressure0?],[x1,y1,pressure1?]...]
     * pressure is optional and exsits when pressure sensitivity is supported, otherwise not.
     */
    points: number[][];
    color: Color;
    lineWidth: number;
};
export declare class HighlighterElementModel extends GfxPrimitiveElementModel<HighlighterProps> {
    /**
     * The SVG path commands for the brush.
     */
    get commands(): string;
    get connectable(): boolean;
    get type(): string;
    containsBound(bounds: Bound): boolean;
    getLineIntersections(start: IVec, end: IVec): PointLocation[] | null;
    getNearestPoint(point: IVec): IVec;
    getRelativePointLocation(position: IVec): PointLocation;
    includesPoint(px: number, py: number, options?: PointTestOptions): boolean;
    accessor color: Color;
    accessor lineWidth: number;
    accessor points: (IVec | IVec3)[];
    accessor rotate: number;
    accessor xywh: SerializedXYWH;
}
//# sourceMappingURL=highlighter.d.ts.map