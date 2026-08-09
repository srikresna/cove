import { ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
export class DocTitleViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-doc-title-fragment';
    }
    effect() {
        super.effect();
        effects();
    }
}
