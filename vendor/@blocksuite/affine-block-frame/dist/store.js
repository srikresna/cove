import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { FrameBlockSchemaExtension } from '@blocksuite/affine-model';
export class FrameStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-frame-block';
    }
    setup(context) {
        super.setup(context);
        context.register([FrameBlockSchemaExtension]);
    }
}
