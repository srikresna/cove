import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { EdgelessClipboardImageConfig } from './edgeless-clipboard-config';
import { effects } from './effects';
import { ImageEdgelessBlockInteraction } from './image-edgeless-block';
import { ImageBlockSpec } from './image-spec';
export class ImageViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-image-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(ImageBlockSpec);
        if (this.isEdgeless(context.scope)) {
            context.register(EdgelessClipboardImageConfig);
            context.register(ImageEdgelessBlockInteraction);
        }
    }
}
