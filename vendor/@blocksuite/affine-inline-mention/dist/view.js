import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { MentionInlineSpecExtension } from './inline-spec';
export class MentionViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-mention-inline';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(MentionInlineSpecExtension);
    }
}
