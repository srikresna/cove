import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { AttachmentBlockSchema } from '@blocksuite/affine-model';
import { SlashMenuConfigExtension } from '@blocksuite/affine-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { AttachmentBlockInteraction } from './attachment-edgeless-block.js';
import { AttachmentDropOption } from './attachment-service.js';
import { attachmentSlashMenuConfig } from './configs/slash-menu.js';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EdgelessClipboardAttachmentConfig } from './edgeless-clipboard-config';
import { effects } from './effects.js';
import { AttachmentEmbedConfigExtension, AttachmentEmbedService, } from './embed';
const flavour = AttachmentBlockSchema.model.flavour;
export class AttachmentViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-attachment-block';
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
                    ? literal `affine-edgeless-attachment`
                    : literal `affine-attachment`;
            }),
            AttachmentDropOption,
            AttachmentEmbedConfigExtension(),
            AttachmentEmbedService,
            SlashMenuConfigExtension(flavour, attachmentSlashMenuConfig),
            ...createBuiltinToolbarConfigExtension(flavour),
        ]);
        if (this.isEdgeless(context.scope)) {
            context.register(EdgelessClipboardAttachmentConfig);
            context.register(AttachmentBlockInteraction);
        }
    }
}
