import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { frameTitleWidget } from './affine-frame-title-widget';
import { effects } from './effects';
export class FrameTitleViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-frame-title-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (context.scope === 'edgeless') {
            context.register(frameTitleWidget);
        }
    }
}
