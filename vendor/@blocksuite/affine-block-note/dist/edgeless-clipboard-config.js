import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/store';
export class EdgelessClipboardNoteConfig extends EdgelessClipboardConfig {
    static { this.key = 'affine:note'; }
    async createBlock(note) {
        const oldId = note.id;
        delete note.props.index;
        if (!note.props.xywh) {
            console.error(`Note block(id: ${oldId}) does not have xywh property`);
            return null;
        }
        const newId = await this.onBlockSnapshotPaste(note, this.std.store, this.std.store.root.id);
        if (!newId) {
            console.error(`Failed to paste note block(id: ${oldId})`);
            return null;
        }
        return newId;
    }
}
