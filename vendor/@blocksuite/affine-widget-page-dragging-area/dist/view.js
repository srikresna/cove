import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { pageDraggingAreaWidget } from './index';
export class PageDraggingAreaViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-page-dragging-area-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            return;
        }
        context.register(pageDraggingAreaWidget);
    }
}
