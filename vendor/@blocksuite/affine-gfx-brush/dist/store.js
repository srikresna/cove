import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { brushToMarkdownAdapterMatcher, brushToPlainTextAdapterMatcher, } from './adapter';
export class BrushStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-brush-gfx';
    }
    setup(context) {
        super.setup(context);
        context.register(brushToMarkdownAdapterMatcher);
        context.register(brushToPlainTextAdapterMatcher);
    }
}
