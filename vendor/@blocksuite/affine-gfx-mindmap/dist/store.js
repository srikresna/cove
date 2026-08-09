import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { mindmapToMarkdownAdapterMatcher, mindmapToPlainTextAdapterMatcher, } from './adapter';
export class MindmapStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-mindmap-gfx';
    }
    setup(context) {
        super.setup(context);
        context.register(mindmapToPlainTextAdapterMatcher);
        context.register(mindmapToMarkdownAdapterMatcher);
    }
}
