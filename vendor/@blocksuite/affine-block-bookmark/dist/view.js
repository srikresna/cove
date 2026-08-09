import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { BookmarkBlockSchema } from '@blocksuite/affine-model';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { BookmarkBlockInteraction } from './bookmark-edgeless-block';
import { BookmarkSlashMenuConfigExtension } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EdgelessClipboardBookmarkConfig } from './edgeless-clipboard-config';
import { effects } from './effects';
const flavour = BookmarkBlockSchema.model.flavour;
export class BookmarkViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-bookmark-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register([
            FlavourExtension(flavour),
            BlockViewExtension(flavour, model => {
                return model.parent?.flavour === 'affine:surface'
                    ? literal `affine-edgeless-bookmark`
                    : literal `affine-bookmark`;
            }),
            BookmarkSlashMenuConfigExtension,
        ]);
        context.register(createBuiltinToolbarConfigExtension(flavour));
        const isEdgeless = this.isEdgeless(context.scope);
        if (isEdgeless) {
            context.register(EdgelessClipboardBookmarkConfig);
            context.register(BookmarkBlockInteraction);
        }
    }
}
