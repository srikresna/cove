import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedLoomConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-loom'; }
    createBlock(loomEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, url, caption, videoId, image, title, description } = loomEmbed.props;
        const embedLoomId = this.crud.addBlock('affine:embed-loom', {
            xywh,
            style,
            url,
            caption,
            videoId,
            image,
            title,
            description,
        }, this.surface.model.id);
        return embedLoomId;
    }
}
