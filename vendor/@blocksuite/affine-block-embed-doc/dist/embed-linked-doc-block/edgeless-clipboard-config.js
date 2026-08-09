import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { ReferenceInfoSchema } from '@blocksuite/affine-model';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedLinkedDocConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-linked-doc'; }
    createBlock(linkedDocEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, caption, pageId, params, title, description } = linkedDocEmbed.props;
        const referenceInfo = ReferenceInfoSchema.parse({
            pageId,
            params,
            title,
            description,
        });
        return this.crud.addBlock('affine:embed-linked-doc', {
            xywh,
            style,
            caption,
            ...referenceInfo,
        }, this.surface.model.id);
    }
}
