import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { DatabaseBlockSchemaExtension } from '@blocksuite/affine-model';
import { DatabaseBlockAdapterExtensions } from './adapters/extension';
import { DatabaseSelectionExtension } from './selection';
export class DatabaseStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-database-block';
    }
    setup(context) {
        super.setup(context);
        context.register(DatabaseBlockSchemaExtension);
        context.register(DatabaseSelectionExtension);
        context.register(DatabaseBlockAdapterExtensions);
    }
}
