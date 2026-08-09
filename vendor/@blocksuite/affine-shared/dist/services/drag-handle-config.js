import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
import { Extension, Slice } from '@blocksuite/store';
export const DndApiExtensionIdentifier = createIdentifier('AffineDndApiIdentifier');
export class DNDAPIExtension extends Extension {
    constructor(std) {
        super();
        this.std = std;
        this.mimeType = 'application/x-blocksuite-dnd';
    }
    static setup(di) {
        di.add(this, [StdIdentifier]);
        di.addImpl(DndApiExtensionIdentifier, provider => provider.get(this));
    }
    decodeSnapshot(data) {
        return JSON.parse(decodeURIComponent(data));
    }
    encodeSnapshot(json) {
        const snapshot = JSON.stringify(json);
        return encodeURIComponent(snapshot);
    }
    fromEntity(options) {
        const { docId, flavour = 'affine:embed-linked-doc', blockId } = options;
        const slice = Slice.fromModels(this.std.store, []);
        const job = this.std.store.getTransformer();
        const snapshot = job.sliceToSnapshot(slice);
        if (!snapshot) {
            console.error('Failed to convert slice to snapshot');
            return null;
        }
        const props = {
            ...options.props,
            ...(blockId ? { blockId } : {}),
            pageId: docId,
            style: flavour === 'affine:embed-synced-doc' ? 'syncedDoc' : 'vertical',
        };
        return {
            ...snapshot,
            content: [
                {
                    id: this.std.workspace.idGenerator(),
                    type: 'block',
                    flavour,
                    props,
                    children: [],
                },
            ],
        };
    }
}
