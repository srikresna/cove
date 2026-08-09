import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardAttachmentConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:attachment'; }
    async createBlock(attachment) {
        if (!this.surface)
            return null;
        const { xywh, rotate, sourceId, name, size, type, embed, style } = attachment.props;
        if (!(await this.std.workspace.blobSync.get(sourceId))) {
            return null;
        }
        const attachmentId = this.crud.addBlock('affine:attachment', {
            xywh,
            rotate,
            sourceId,
            name,
            size,
            type,
            embed,
            style,
        }, this.surface.model.id);
        return attachmentId;
    }
}
