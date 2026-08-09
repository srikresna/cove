import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { EmbedLinkedDocBlockSchemaExtension, EmbedSyncedDocBlockSchemaExtension, } from '@blocksuite/affine-model';
import { EmbedLinkedDocBlockAdapterExtensions } from './embed-linked-doc-block/adapters/extension';
import { EmbedSyncedDocBlockAdapterExtensions } from './embed-synced-doc-block/adapters/extension';
export class EmbedDocStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-embed-doc-block';
    }
    setup(context) {
        super.setup(context);
        context.register([
            EmbedSyncedDocBlockSchemaExtension,
            EmbedLinkedDocBlockSchemaExtension,
        ]);
        context.register(EmbedLinkedDocBlockAdapterExtensions);
        context.register(EmbedSyncedDocBlockAdapterExtensions);
    }
}
