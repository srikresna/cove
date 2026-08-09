import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardBookmarkConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:bookmark'; }
    createBlock(bookmark) {
        if (!this.surface)
            return null;
        const { xywh, style, url, caption, description, icon, image, title } = bookmark.props;
        const bookmarkId = this.crud.addBlock('affine:bookmark', {
            xywh,
            style,
            url,
            caption,
            description,
            icon,
            image,
            title,
        }, this.surface.model.id);
        return bookmarkId;
    }
}
