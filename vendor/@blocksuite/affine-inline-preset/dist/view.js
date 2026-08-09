import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { DefaultInlineManagerExtension } from './default-inline-manager';
import { effects } from './effects';
import { InlineSpecExtensions } from './inline-spec';
import { MarkdownExtensions } from './markdown';
export class InlinePresetViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-inline-preset';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(DefaultInlineManagerExtension);
        context.register(InlineSpecExtensions);
        context.register(MarkdownExtensions);
    }
}
