import { createIdentifier } from '@blocksuite/global/di';
import { BlockSuiteError } from '@blocksuite/global/exceptions';
import { StdIdentifier } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
import { getSurfaceComponent } from '../utils/get-surface-block';
import { EdgelessCRUDIdentifier } from './crud-extension';
export const EdgelessClipboardConfigIdentifier = createIdentifier('edgeless-clipboard-config');
export class EdgelessClipboardConfig extends Extension {
    constructor(std) {
        super();
        this.std = std;
        this.onBlockSnapshotPaste = async (snapshot, doc, parent, index) => {
            const block = await this.std.clipboard.pasteBlockSnapshot(snapshot, doc, parent, index);
            return block?.id ?? null;
        };
    }
    get surface() {
        return getSurfaceComponent(this.std);
    }
    get crud() {
        return this.std.get(EdgelessCRUDIdentifier);
    }
    static setup(di) {
        if (!this.key) {
            throw new BlockSuiteError(BlockSuiteError.ErrorCode.ValueNotExists, 'Key is not defined in the EdgelessClipboardConfig');
        }
        di.add(this, [StdIdentifier]);
        di.addImpl(EdgelessClipboardConfigIdentifier(this.key), provider => provider.get(this));
    }
}
