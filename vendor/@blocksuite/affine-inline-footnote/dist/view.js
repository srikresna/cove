import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { FootNoteInlineSpecExtension } from './inline-spec';
export class FootnoteViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-footnote-inline';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(FootNoteInlineSpecExtension);
    }
}
