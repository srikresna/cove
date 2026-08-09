import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { SurfaceRefBlockSchemaExtension } from '@blocksuite/affine-model';
export class SurfaceRefStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-surface-ref-block';
    }
    setup(context) {
        super.setup(context);
        context.register(SurfaceRefBlockSchemaExtension);
    }
}
