import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier, WidgetViewExtension, } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
import { literal, unsafeStatic } from 'lit/static-html.js';
import { defaultSlashMenuConfig } from './config';
import { AFFINE_SLASH_MENU_WIDGET } from './consts';
import { mergeSlashMenuConfigs } from './utils';
export class SlashMenuExtension extends Extension {
    static setup(di) {
        WidgetViewExtension('affine:page', AFFINE_SLASH_MENU_WIDGET, literal `${unsafeStatic(AFFINE_SLASH_MENU_WIDGET)}`).setup(di);
        di.add(this, [StdIdentifier]);
        SlashMenuConfigExtension('default', defaultSlashMenuConfig).setup(di);
    }
    constructor(std) {
        super();
        this.std = std;
        this.config = mergeSlashMenuConfigs(this.std.provider.getAll(SlashMenuConfigIdentifier));
    }
}
export const SlashMenuConfigIdentifier = createIdentifier(`${AFFINE_SLASH_MENU_WIDGET}-config`);
export function SlashMenuConfigExtension(id, config) {
    return {
        setup: di => {
            di.addImpl(SlashMenuConfigIdentifier(id), config);
        },
    };
}
