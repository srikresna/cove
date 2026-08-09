import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { SlashMenuExtension } from './extensions';
export class SlashMenuViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-slash-menu-widget';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        if (this.isMobile(context.scope))
            return;
        context.register(SlashMenuExtension);
    }
}
