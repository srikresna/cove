import { getSurfaceComponent, ToolOverlay, } from '@blocksuite/affine-block-surface';
import { DefaultTheme, } from '@blocksuite/affine-model';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { assertType } from '@blocksuite/global/utils';
import { effect } from '@preact/signals-core';
import { SHAPE_OVERLAY_HEIGHT, SHAPE_OVERLAY_OFFSET_X, SHAPE_OVERLAY_OFFSET_Y, SHAPE_OVERLAY_WIDTH, } from '../consts';
import { ShapeFactory } from './factory';
export class ShapeOverlay extends ToolOverlay {
    constructor(gfx, type, options, style) {
        super(gfx);
        const xywh = [
            this.x,
            this.y,
            SHAPE_OVERLAY_WIDTH,
            SHAPE_OVERLAY_HEIGHT,
        ];
        const { shapeStyle, fillColor, strokeColor } = style;
        const fill = this.gfx.std
            .get(ThemeProvider)
            .getColorValue(fillColor, DefaultTheme.shapeFillColor, true);
        const stroke = this.gfx.std
            .get(ThemeProvider)
            .getColorValue(strokeColor, DefaultTheme.shapeStrokeColor, true);
        options.fill = fill;
        options.stroke = stroke;
        this.shape = ShapeFactory.createShape(xywh, type, options, shapeStyle);
        this.disposables.add(effect(() => {
            const currentTool = this.gfx.tool.currentTool$.value;
            if (currentTool?.toolName !== 'shape')
                return;
            assertType(currentTool);
            const { shapeName } = currentTool.activatedOption;
            const newOptions = {
                ...options,
            };
            let { x, y } = this;
            if (shapeName === 'roundedRect' || shapeName === 'rect') {
                x += SHAPE_OVERLAY_OFFSET_X;
                y += SHAPE_OVERLAY_OFFSET_Y;
            }
            const w = shapeName === 'roundedRect'
                ? SHAPE_OVERLAY_WIDTH + 40
                : SHAPE_OVERLAY_WIDTH;
            const xywh = [x, y, w, SHAPE_OVERLAY_HEIGHT];
            this.shape = ShapeFactory.createShape(xywh, shapeName, newOptions, shapeStyle);
            const surface = getSurfaceComponent(this.gfx.std);
            surface?.refresh();
        }));
    }
    render(ctx, rc) {
        ctx.globalAlpha = this.globalAlpha;
        let { x, y } = this;
        const { type } = this.shape;
        if (type === 'roundedRect' || type === 'rect') {
            x += SHAPE_OVERLAY_OFFSET_X;
            y += SHAPE_OVERLAY_OFFSET_Y;
        }
        const w = type === 'roundedRect' ? SHAPE_OVERLAY_WIDTH + 40 : SHAPE_OVERLAY_WIDTH;
        const xywh = [x, y, w, SHAPE_OVERLAY_HEIGHT];
        this.shape.xywh = xywh;
        this.shape.draw(ctx, rc);
    }
}
