import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { DblClickAddEdgelessText } from './dblclick-add-edgeless-text';
import { effects } from './effects';
import { TextElementRendererExtension } from './element-renderer';
import { TextElementView, TextInteraction } from './element-view';
import { TextTool } from './tool';
import { textToolbarExtension } from './toolbar';
export class TextViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-text-gfx';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(TextElementView);
        context.register(TextElementRendererExtension);
        if (this.isEdgeless(context.scope)) {
            context.register(TextTool);
            context.register(textToolbarExtension);
            context.register(DblClickAddEdgelessText);
            context.register(TextInteraction);
        }
    }
}
