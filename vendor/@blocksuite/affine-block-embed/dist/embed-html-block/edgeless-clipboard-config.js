import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEmbedHtmlConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:embed-html'; }
    createBlock(htmlEmbed) {
        if (!this.surface)
            return null;
        const { xywh, style, caption, html, design } = htmlEmbed.props;
        const embedHtmlId = this.crud.addBlock('affine:embed-html', {
            xywh,
            style,
            caption,
            html,
            design,
        }, this.surface.model.id);
        return embedHtmlId;
    }
}
