import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { autoConnectWidget } from '.';
import { effects } from './effects';
export class EdgelessAutoConnectViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-auto-connect-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isEdgeless(context.scope)) {
            context.register(autoConnectWidget);
        }
    }
}
