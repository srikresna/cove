import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { EdgelessSurfaceBlockAdapterExtensions } from './adapters';
import { SurfaceBlockSchemaExtension } from './surface-model';
export class SurfaceStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-surface-block';
    }
    setup(context) {
        super.setup(context);
        context.register(SurfaceBlockSchemaExtension);
        context.register(EdgelessSurfaceBlockAdapterExtensions);
    }
}
