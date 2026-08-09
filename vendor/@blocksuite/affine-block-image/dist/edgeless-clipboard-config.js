import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardImageConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:image'; }
    async createBlock(image) {
        const { xywh, rotate, sourceId, size, width, height, caption } = image.props;
        if (!this.surface)
            return null;
        if (!(await this.std.workspace.blobSync.get(sourceId))) {
            return null;
        }
        return this.crud.addBlock('affine:image', {
            caption,
            sourceId,
            xywh,
            rotate,
            size,
            width,
            height,
        }, this.surface.model.id);
    }
}
