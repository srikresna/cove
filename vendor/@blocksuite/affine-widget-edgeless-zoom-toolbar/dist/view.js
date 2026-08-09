import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { edgelessZoomToolbarWidget } from './index';
export class EdgelessZoomToolbarViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-zoom-toolbar-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(edgelessZoomToolbarWidget);
        }
    }
}
