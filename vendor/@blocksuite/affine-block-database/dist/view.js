import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { DatabaseBlockModel } from '@blocksuite/affine-model';
import { SlashMenuConfigExtension } from '@blocksuite/affine-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { z } from 'zod';
import { DatabaseConfigExtension } from './config';
import { databaseSlashMenuConfig } from './configs/slash-menu.js';
import { effects } from './effects';
const optionsSchema = z.object({
    configure: z
        .function()
        .args(z.instanceof(DatabaseBlockModel), z.custom())
        .returns(z.custom()),
});
export class DatabaseViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-database-block';
        this.schema = optionsSchema;
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context, options) {
        super.setup(context);
        context.register([
            FlavourExtension('affine:database'),
            BlockViewExtension('affine:database', literal `affine-database`),
            SlashMenuConfigExtension('affine:database', databaseSlashMenuConfig),
        ]);
        if (options) {
            context.register(DatabaseConfigExtension({ configure: options.configure }));
        }
    }
}
