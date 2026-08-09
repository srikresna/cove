import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { edgelessSelectedRectWidget } from './spec';
export class EdgelessSelectedRectViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-selected-rect-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(edgelessSelectedRectWidget);
        }
    }
}
