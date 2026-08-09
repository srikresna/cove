import { type Options, type RoughCanvas, ToolOverlay } from '@blocksuite/affine-block-surface';
import { type Color, type ShapeStyle } from '@blocksuite/affine-model';
import type { GfxController } from '@blocksuite/std/gfx';
import type { Shape } from './shape';
export declare class ShapeOverlay extends ToolOverlay {
    shape: Shape;
    constructor(gfx: GfxController, type: string, options: Options, style: {
        shapeStyle: ShapeStyle;
        fillColor: Color;
        strokeColor: Color;
    });
    render(ctx: CanvasRenderingContext2D, rc: RoughCanvas): void;
}
//# sourceMappingURL=shape-overlay.d.ts.map