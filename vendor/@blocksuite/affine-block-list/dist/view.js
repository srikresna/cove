import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { effects } from './effects.js';
import { ListKeymapExtension, ListTextKeymapExtension } from './list-keymap.js';
import { ListMarkdownExtension } from './markdown.js';
export class ListViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-list-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            FlavourExtension('affine:list'),
            BlockViewExtension('affine:list', literal `affine-list`),
            ListKeymapExtension,
            ListTextKeymapExtension,
            ListMarkdownExtension,
        ]);
    }
}
