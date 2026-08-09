import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { edgelessDraggingAreaWidget } from './edgeless-dragging-area-rect';
import { effects } from './effects';
export class EdgelessDraggingAreaViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-dragging-area-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(edgelessDraggingAreaWidget);
        }
    }
}
