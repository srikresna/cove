import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { ParagraphBlockSchemaExtension } from '@blocksuite/affine-model';
import { ParagraphBlockAdapterExtensions } from './adapters/extension';
export class ParagraphStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-paragraph-block';
    }
    setup(context) {
        super.setup(context);
        context.register(ParagraphBlockSchemaExtension);
        context.register(ParagraphBlockAdapterExtensions);
    }
}
