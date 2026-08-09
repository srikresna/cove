import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { IS_MOBILE } from '@blocksuite/global/env';
import { effects } from './effects';
import { keyboardToolbarWidget } from './widget';
export class KeyboardToolbarViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-keyboard-toolbar-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (context.scope === 'mobile-page' ||
            // Legacy mobile page
            (context.scope === 'page' && IS_MOBILE)) {
            context.register(keyboardToolbarWidget);
        }
    }
}
