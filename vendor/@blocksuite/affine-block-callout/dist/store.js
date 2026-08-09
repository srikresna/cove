import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { CalloutBlockSchemaExtension } from '@blocksuite/affine-model';
import { CalloutBlockMarkdownAdapterExtension } from './adapters/markdown';
export class CalloutStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-callout-block';
    }
    setup(context) {
        super.setup(context);
        context.register(CalloutBlockSchemaExtension);
        context.register(CalloutBlockMarkdownAdapterExtension);
    }
}
