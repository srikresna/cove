import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardEdgelessTextConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:edgeless-text'; }
    async createBlock(edgelessText) {
        const oldId = edgelessText.id;
        delete edgelessText.props.index;
        if (!edgelessText.props.xywh) {
            console.error(`EdgelessText block(id: ${oldId}) does not have xywh property`);
            return null;
        }
        if (!this.surface) {
            return null;
        }
        const newId = await this.onBlockSnapshotPaste(edgelessText, this.std.store, this.surface.model.id);
        if (!newId) {
            console.error(`Failed to paste EdgelessText block(id: ${oldId})`);
            return null;
        }
        return newId;
    }
}
