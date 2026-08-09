import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { ReferenceInfoSchema } from '@blocksuite/affine-model';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedSyncedDocConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-synced-doc'; }
    createBlock(syncedDocEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, caption, scale, pageId, params } = syncedDocEmbed.props;
        const referenceInfo = ReferenceInfoSchema.parse({ pageId, params });
        return this.crud.addBlock('affine:embed-synced-doc', {
            xywh,
            style,
            caption,
            scale,
            ...referenceInfo,
        }, this.surface.model.id);
    }
}
