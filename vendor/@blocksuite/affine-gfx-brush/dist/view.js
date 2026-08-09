import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BrushTool } from './brush-tool';
import { effects } from './effects';
import { EraserTool } from './eraser-tool';
import { HighlighterTool } from './highlighter-tool';
import { BrushDomRendererExtension, BrushElementRendererExtension, HighlighterDomRendererExtension, HighlighterElementRendererExtension, } from './renderer';
import { brushToolbarExtension, highlighterToolbarExtension, } from './toolbar/configs';
import { penSeniorTool } from './toolbar/senior-tool';
export class BrushViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-brush-gfx';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(BrushTool);
        context.register(EraserTool);
        context.register(HighlighterTool);
        context.register(BrushElementRendererExtension);
        context.register(BrushDomRendererExtension);
        context.register(HighlighterElementRendererExtension);
        context.register(HighlighterDomRendererExtension);
        context.register(brushToolbarExtension);
        context.register(highlighterToolbarExtension);
        context.register(penSeniorTool);
    }
}
