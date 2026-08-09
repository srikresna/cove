import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { SlashMenuConfigExtension } from '@blocksuite/affine-widget-slash-menu';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { latexSlashMenuConfig } from './configs/slash-menu';
import { effects } from './effects';
export class LatexViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-latex-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            BlockViewExtension('affine:latex', literal `affine-latex`),
            SlashMenuConfigExtension('affine:latex', latexSlashMenuConfig),
        ]);
    }
}
