import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { edgelessToolbarWidget } from './edgeless-toolbar';
import { effects } from './effects';
export class EdgelessToolbarViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-toolbar-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(edgelessToolbarWidget);
        }
    }
}
