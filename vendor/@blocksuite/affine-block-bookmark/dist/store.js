import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BookmarkBlockSchemaExtension } from '@blocksuite/affine-model';
import { BookmarkBlockAdapterExtensions } from './adapters/extension';
export class BookmarkStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-bookmark-block';
    }
    setup(context) {
        super.setup(context);
        context.register(BookmarkBlockSchemaExtension);
        context.register(BookmarkBlockAdapterExtensions);
    }
}
