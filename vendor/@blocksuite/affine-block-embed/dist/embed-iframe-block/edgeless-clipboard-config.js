import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedIframeConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-iframe'; }
    createBlock(embedIframe) {
        if (!this.surface)
            return null;
        const { xywh, caption, url, title, description, iframeUrl, scale, width, height, } = embedIframe.props;
        return this.crud.addBlock('affine:embed-iframe', {
            url,
            iframeUrl,
            xywh,
            caption,
            title,
            description,
            scale,
            width,
            height,
        }, this.surface.model.id);
    }
}
