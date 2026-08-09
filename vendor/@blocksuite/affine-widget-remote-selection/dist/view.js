import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { docRemoteSelectionWidget, edgelessRemoteSelectionWidget, } from './index';
export class RemoteSelectionViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-remote-selection-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(docRemoteSelectionWidget);
        if (context.scope === 'edgeless') {
            context.register(edgelessRemoteSelectionWidget);
        }
    }
}
