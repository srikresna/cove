import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { DataViewBlockSchemaExtension } from './data-view-model';
export class DataViewStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-data-view-block';
    }
    setup(context) {
        super.setup(context);
        context.register(DataViewBlockSchemaExtension);
    }
}
