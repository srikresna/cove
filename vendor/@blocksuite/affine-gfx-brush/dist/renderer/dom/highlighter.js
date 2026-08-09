import { DomElementRendererExtension, } from '@blocksuite/affine-block-surface';
import { DefaultTheme } from '@blocksuite/affine-model';
import { renderBrushLikeDom } from './shared';
export const HighlighterDomRendererExtension = DomElementRendererExtension('highlighter', (model, domElement, renderer) => {
    renderBrushLikeDom({
        model,
        domElement,
        renderer,
        color: renderer.getColorValue(model.color, DefaultTheme.hightlighterColor, true),
    });
});
