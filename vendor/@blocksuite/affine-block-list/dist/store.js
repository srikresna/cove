import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { ListBlockSchemaExtension } from '@blocksuite/affine-model';
import { ListBlockAdapterExtensions } from './adapters/extension';
export class ListStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-list-block';
    }
    setup(context) {
        super.setup(context);
        context.register(ListBlockSchemaExtension);
        context.register(ListBlockAdapterExtensions);
    }
}
