import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { TableBlockSchemaExtension } from '@blocksuite/affine-model';
import { TableBlockAdapterExtensions } from './adapters/extension';
import { TableSelectionExtension } from './selection-schema';
export class TableStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-table-block';
    }
    setup(context) {
        super.setup(context);
        context.register(TableBlockSchemaExtension);
        context.register(TableBlockAdapterExtensions);
        context.register(TableSelectionExtension);
    }
}
