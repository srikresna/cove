import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { ImageBlockSchemaExtension } from '@blocksuite/affine-model';
import { ImageSelectionExtension } from '@blocksuite/affine-shared/selection';
import { ImageBlockAdapterExtensions } from './adapters/extension';
export class ImageStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-image-block';
    }
    setup(context) {
        super.setup(context);
        context.register([ImageBlockSchemaExtension, ImageSelectionExtension]);
        context.register(ImageBlockAdapterExtensions);
    }
}
