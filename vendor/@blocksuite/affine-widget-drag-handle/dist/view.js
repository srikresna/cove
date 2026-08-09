import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { dragHandleWidget } from '.';
import { effects } from './effects';
export class DragHandleViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-drag-handle-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(dragHandleWidget);
    }
}
