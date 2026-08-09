import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedYoutubeConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-youtube'; }
    createBlock(youtubeEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, url, caption, videoId, image, title, description, creator, creatorUrl, creatorImage, } = youtubeEmbed.props;
        const embedYoutubeId = this.crud.addBlock('affine:embed-youtube', {
            xywh,
            style,
            url,
            caption,
            videoId,
            image,
            title,
            description,
            creator,
            creatorUrl,
            creatorImage,
        }, this.surface.model.id);
        return embedYoutubeId;
    }
}
