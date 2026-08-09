import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { RootBlockSchemaExtension } from '@blocksuite/affine-model';
import { RootBlockAdapterExtensions } from './adapters/extension';
export class RootStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-root-block';
    }
    setup(context) {
        super.setup(context);
        context.register(RootBlockSchemaExtension);
        context.register(RootBlockAdapterExtensions);
    }
}
