import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { SlashMenuConfigExtension } from '@blocksuite/affine-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { CalloutKeymapExtension } from './callout-keymap';
import { calloutSlashMenuConfig } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { effects } from './effects';
export class CalloutViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-callout-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            FlavourExtension('affine:callout'),
            BlockViewExtension('affine:callout', literal `affine-callout`),
            CalloutKeymapExtension,
            SlashMenuConfigExtension('affine:callout', calloutSlashMenuConfig),
            ...createBuiltinToolbarConfigExtension('affine:callout'),
        ]);
    }
}
