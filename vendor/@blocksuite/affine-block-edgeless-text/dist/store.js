import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { EdgelessTextBlockSchemaExtension } from '@blocksuite/affine-model';
export class EdgelessTextStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-edgeless-text-block';
    }
    setup(context) {
        super.setup(context);
        context.register(EdgelessTextBlockSchemaExtension);
    }
}
