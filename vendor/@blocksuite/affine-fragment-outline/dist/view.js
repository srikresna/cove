import { ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
export class OutlineViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-outline-fragment';
    }
    effect() {
        super.effect();
        effects();
    }
}
