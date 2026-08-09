import type { Bound, IBound, IVec, PointLocation, SerializedXYWH } from '@blocksuite/global/gfx';
import type { BaseElementProps, PointTestOptions } from '@blocksuite/std/gfx';
import { GfxLocalElementModel, GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import * as Y from 'yjs';
import { FontStyle, FontWeight, ShapeStyle, ShapeType, StrokeStyle, TextAlign, TextResizing, type TextStyleProps, TextVerticalAlign } from '../../consts/index.js';
import { type Color } from '../../themes/index.js';
export type ShapeProps = BaseElementProps & {
    shapeType: ShapeType;
    radius: number;
    filled: boolean;
    fillColor: Color;
    strokeWidth: number;
    strokeColor: Color;
    strokeStyle: StrokeStyle;
    shapeStyle: ShapeStyle;
    roughness?: number;
    text?: Y.Text;
    textHorizontalAlign?: TextAlign;
    textVerticalAlign?: TextVerticalAlign;
    textResizing?: TextResizing;
    maxWidth?: false | number;
} & Partial<TextStyleProps>;
export declare const SHAPE_TEXT_PADDING = 20;
export declare const SHAPE_TEXT_VERTICAL_PADDING = 10;
export declare class ShapeElementModel extends GfxPrimitiveElementModel<ShapeProps> {
    /**
     * The bound of the text content.
     */
    textBound: IBound | null;
    get type(): string;
    static propsToY(props: ShapeProps): ShapeProps;
    containsBound(bounds: Bound): boolean;
    getLineIntersections(start: IVec, end: IVec): PointLocation[] | null;
    getNearestPoint(point: IVec): IVec;
    getRelativePointLocation(point: IVec): PointLocation;
    includesPoint(x: number, y: number, options: PointTestOptions): boolean;
    accessor color: Color;
    accessor fillColor: Color;
    accessor filled: boolean;
    accessor fontFamily: string;
    accessor fontSize: number;
    accessor fontStyle: FontStyle;
    accessor fontWeight: FontWeight;
    accessor maxWidth: false | number;
    accessor padding: [number, number];
    accessor radius: number;
    accessor rotate: number;
    accessor roughness: number;
    accessor shadow: {
        /**
         * @deprecated Since the shadow blur will reduce the performance of canvas rendering,
         * we already disable the shadow blur rendering by default, so set this field will not take effect.
         * You can enable it by setting the flag `enable_shape_shadow_blur` in the awareness store.
         * https://web.dev/articles/canvas-performance#avoid_shadowblur
         */
        blur: number;
        offsetX: number;
        offsetY: number;
        color: Color;
    } | null;
    accessor shapeStyle: ShapeStyle;
    accessor shapeType: ShapeType;
    accessor strokeColor: Color;
    accessor strokeStyle: StrokeStyle;
    accessor strokeWidth: number;
    accessor text: Y.Text | undefined;
    accessor textAlign: TextAlign;
    accessor textDisplay: boolean;
    accessor textHorizontalAlign: TextAlign;
    accessor textResizing: TextResizing;
    accessor textVerticalAlign: TextVerticalAlign;
    accessor xywh: SerializedXYWH;
}
export declare class LocalShapeElementModel extends GfxLocalElementModel {
    roughness: number;
    textBound: Bound | null;
    textDisplay: boolean;
    get type(): string;
    accessor color: Color;
    accessor fillColor: Color;
    accessor filled: boolean;
    accessor fontFamily: string;
    accessor fontSize: number;
    accessor fontStyle: FontStyle;
    accessor fontWeight: FontWeight;
    accessor padding: [number, number];
    accessor radius: number;
    accessor shadow: {
        blur: number;
        offsetX: number;
        offsetY: number;
        color: Color;
    } | null;
    accessor shapeStyle: ShapeStyle;
    accessor shapeType: ShapeType;
    accessor strokeColor: Color;
    accessor strokeStyle: StrokeStyle;
    accessor strokeWidth: number;
    accessor text: string;
    accessor textAlign: TextAlign;
    accessor textVerticalAlign: TextVerticalAlign;
}
//# sourceMappingURL=shape.d.ts.map