import type { Options, RoughCanvas } from '@blocksuite/affine-block-surface';
import type { ShapeStyle } from '@blocksuite/affine-model';
import type { XYWH } from '@blocksuite/global/gfx';
export declare abstract class Shape {
    options: Options;
    shapeStyle: ShapeStyle;
    type: string;
    xywh: XYWH;
    constructor(xywh: XYWH, type: string, options: Options, shapeStyle: ShapeStyle);
    abstract draw(ctx: CanvasRenderingContext2D, rc: RoughCanvas): void;
}
//# sourceMappingURL=shape.d.ts.map