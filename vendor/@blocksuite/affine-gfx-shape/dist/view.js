import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { ShapeElementRendererExtension } from './element-renderer';
import { ShapeDomRendererExtension } from './element-renderer/shape-dom';
import { ShapeElementView, ShapeViewInteraction } from './element-view';
import { ShapeTool } from './shape-tool';
import { shapeSeniorTool, shapeToolbarExtension } from './toolbar';
export class ShapeViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-shape-gfx';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(ShapeElementRendererExtension);
            context.register(ShapeDomRendererExtension);
            context.register(ShapeElementView);
            context.register(ShapeTool);
            context.register(shapeSeniorTool);
            context.register(shapeToolbarExtension);
            context.register(ShapeViewInteraction);
        }
    }
}
