import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { AttachmentBlockSchemaExtension } from '@blocksuite/affine-model';
import { AttachmentBlockAdapterExtensions } from './adapters/extension';
export class AttachmentStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-attachment-block';
    }
    setup(context) {
        super.setup(context);
        context.register(AttachmentBlockSchemaExtension);
        context.register(AttachmentBlockAdapterExtensions);
    }
}
