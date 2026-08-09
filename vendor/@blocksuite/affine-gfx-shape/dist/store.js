import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { shapeToMarkdownAdapterMatcher, shapeToPlainTextAdapterMatcher, } from './adapter';
export class ShapeStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-shape-gfx';
    }
    setup(context) {
        super.setup(context);
        context.register(shapeToMarkdownAdapterMatcher);
        context.register(shapeToPlainTextAdapterMatcher);
    }
}
