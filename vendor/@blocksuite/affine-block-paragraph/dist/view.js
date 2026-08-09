import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { ParagraphBlockModel } from '@blocksuite/affine-model';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { z } from 'zod';
import { effects } from './effects';
import { ParagraphMarkdownExtension } from './markdown.js';
import { ParagraphBlockConfigExtension } from './paragraph-block-config.js';
import { ParagraphKeymapExtension, ParagraphTextKeymapExtension, } from './paragraph-keymap.js';
const placeholders = {
    text: "Type '/' for commands",
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    h4: 'Heading 4',
    h5: 'Heading 5',
    h6: 'Heading 6',
    quote: '',
};
const optionsSchema = z.object({
    getPlaceholder: z.optional(z.function().args(z.instanceof(ParagraphBlockModel)).returns(z.string())),
});
export class ParagraphViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-paragraph-block';
        this.schema = optionsSchema;
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context, options) {
        super.setup(context, options);
        const getPlaceholder = options?.getPlaceholder ?? (model => placeholders[model.props.type]);
        context.register([
            FlavourExtension('affine:paragraph'),
            BlockViewExtension('affine:paragraph', literal `affine-paragraph`),
            ParagraphTextKeymapExtension,
            ParagraphKeymapExtension,
            ParagraphBlockConfigExtension({
                getPlaceholder,
            }),
            ParagraphMarkdownExtension,
        ]);
    }
}
