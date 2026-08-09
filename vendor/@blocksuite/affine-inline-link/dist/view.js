import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { LinkInlineSpecExtension } from './inline-spec';
import { linkToolbar } from './toolbar';
export class LinkViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-link-inline';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(LinkInlineSpecExtension);
        context.register(linkToolbar);
    }
}
