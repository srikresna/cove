import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { DividerBlockSchemaExtension } from '@blocksuite/affine-model';
import { DividerBlockAdapterExtensions } from './adapters/extension';
export class DividerStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-divider-block';
    }
    setup(context) {
        super.setup(context);
        context.register(DividerBlockSchemaExtension);
        context.register(DividerBlockAdapterExtensions);
    }
}
