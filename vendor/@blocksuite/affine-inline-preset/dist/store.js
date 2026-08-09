import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { InlineAdapterExtensions } from './adapters/extensions';
export class InlinePresetStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-inline-preset';
    }
    setup(context) {
        super.setup(context);
        context.register(InlineAdapterExtensions);
    }
}
