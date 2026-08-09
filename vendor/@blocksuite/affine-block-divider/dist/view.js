import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { effects } from './effects';
import { DividerMarkdownExtension } from './markdown';
export class DividerViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-divider-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            BlockViewExtension('affine:divider', literal `affine-divider`),
            DividerMarkdownExtension,
        ]);
    }
}
