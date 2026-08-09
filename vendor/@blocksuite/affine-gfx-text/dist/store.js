import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { textToMarkdownAdapterMatcher, textToPlainTextAdapterMatcher, } from './adapter';
export class TextStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-text-gfx';
    }
    setup(context) {
        super.setup(context);
        context.register(textToMarkdownAdapterMatcher);
        context.register(textToPlainTextAdapterMatcher);
    }
}
