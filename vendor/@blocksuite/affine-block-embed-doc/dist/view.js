import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { effects } from './effects';
import { EdgelessClipboardEmbedLinkedDocConfig, EmbedLinkedDocInteraction, EmbedLinkedDocViewExtensions, } from './embed-linked-doc-block';
import { EdgelessClipboardEmbedSyncedDocConfig, EmbedSyncedDocViewExtensions, } from './embed-synced-doc-block';
import { EmbedSyncedDocInteraction } from './embed-synced-doc-block/configs/edgeless-interaction';
export class EmbedDocViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-embed-doc-block';
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context) {
        super.setup(context);
        context.register(EmbedLinkedDocViewExtensions);
        context.register(EmbedSyncedDocViewExtensions);
        const isEdgeless = this.isEdgeless(context.scope);
        if (isEdgeless) {
            context.register([
                EdgelessClipboardEmbedLinkedDocConfig,
                EdgelessClipboardEmbedSyncedDocConfig,
                EmbedLinkedDocInteraction,
                EmbedSyncedDocInteraction,
            ]);
        }
    }
}
