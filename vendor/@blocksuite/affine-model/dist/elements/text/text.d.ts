import type { IVec, SerializedXYWH } from '@blocksuite/global/gfx';
import { Bound } from '@blocksuite/global/gfx';
import type { BaseElementProps } from '@blocksuite/std/gfx';
import { GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import * as Y from 'yjs';
import { FontFamily, FontStyle, FontWeight, TextAlign, type TextStyleProps } from '../../consts/index';
import { type Color } from '../../themes/index';
export type TextElementProps = BaseElementProps & {
    text: Y.Text;
    hasMaxWidth?: boolean;
} & Omit<TextStyleProps, 'fontWeight' | 'fontStyle'> & Partial<Pick<TextStyleProps, 'fontWeight' | 'fontStyle'>>;
export declare class TextElementModel extends GfxPrimitiveElementModel<TextElementProps> {
    get type(): string;
    static propsToY(props: Record<string, unknown>): Record<string, unknown>;
    containsBound(bounds: Bound): boolean;
    getLineIntersections(start: IVec, end: IVec): import("@blocksuite/global/gfx").PointLocation[] | null;
    getNearestPoint(point: IVec): IVec;
    includesPoint(x: number, y: number): boolean;
    accessor color: Color;
    accessor fontFamily: FontFamily;
    accessor fontSize: number;
    accessor fontStyle: FontStyle;
    accessor fontWeight: FontWeight;
    accessor hasMaxWidth: boolean;
    accessor rotate: number;
    accessor text: Y.Text;
    accessor textAlign: TextAlign;
    accessor xywh: SerializedXYWH;
}
//# sourceMappingURL=text.d.ts.map