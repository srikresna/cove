import { FlatSyncController } from './flat-sync-controller.js';
import { SyncController } from './sync-controller.js';
export class Block {
    get flavour() {
        return this._syncController.flavour;
    }
    get id() {
        return this._syncController.id;
    }
    get model() {
        return this._syncController.model;
    }
    get pop() {
        return this._syncController.pop;
    }
    get stash() {
        return this._syncController.stash;
    }
    get version() {
        return this._syncController.version;
    }
    constructor(schema, yBlock, doc, options = {}) {
        this.schema = schema;
        this.yBlock = yBlock;
        this.doc = doc;
        this.options = options;
        this.blockViewType = 'display';
        const onChange = !options.onChange
            ? undefined
            : (key, isLocal) => {
                if (!this._syncController || !this.model) {
                    return;
                }
                options.onChange?.(this, key, isLocal);
            };
        const flavour = yBlock.get('sys:flavour');
        const blockSchema = this.schema.get(flavour);
        if (blockSchema?.model.isFlatData) {
            this._syncController = new FlatSyncController(schema, yBlock, doc, onChange);
        }
        else {
            this._syncController = new SyncController(schema, yBlock, doc, onChange);
        }
    }
}
