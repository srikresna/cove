import { ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
export class FramePanelViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-frame-panel-fragment';
    }
    effect() {
        super.effect();
        effects();
    }
}
