import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedFigmaConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-figma'; }
    createBlock(figmaEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, url, caption, title, description } = figmaEmbed.props;
        const embedFigmaId = this.crud.addBlock('affine:embed-figma', {
            xywh,
            style,
            url,
            caption,
            title,
            description,
        }, this.surface.model.id);
        return embedFigmaId;
    }
}
