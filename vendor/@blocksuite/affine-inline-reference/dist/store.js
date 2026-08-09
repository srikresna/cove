import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { referenceDeltaMarkdownAdapterMatch, referenceDeltaToHtmlAdapterMatcher, referenceDeltaToMarkdownAdapterMatcher, } from './adapters';
export class ReferenceStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-reference-inline';
    }
    setup(context) {
        super.setup(context);
        context.register(referenceDeltaToHtmlAdapterMatcher);
        context.register(referenceDeltaToMarkdownAdapterMatcher);
        context.register(referenceDeltaMarkdownAdapterMatch);
    }
}
