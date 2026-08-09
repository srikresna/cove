import * as Y from 'yjs';
import { StoreContainer } from '../model/index.js';
export class TestDoc {
    get blobSync() {
        return this.workspace.blobSync;
    }
    get workspace() {
        return this._collection;
    }
    get isEmpty() {
        return this._yBlocks.size === 0;
    }
    get loaded() {
        return this._loaded;
    }
    get meta() {
        return this.workspace.meta.getDocMeta(this.id);
    }
    get ready() {
        return this._ready;
    }
    get spaceDoc() {
        return this._ySpaceDoc;
    }
    get yBlocks() {
        return this._yBlocks;
    }
    constructor({ id, collection, doc, awarenessStore }) {
        this._initSubDoc = () => {
            let subDoc = this.rootDoc.getMap('spaces').get(this.id);
            if (!subDoc) {
                subDoc = new Y.Doc({
                    guid: this.id,
                });
                this.rootDoc.getMap('spaces').set(this.id, subDoc);
                this._loaded = true;
            }
            else {
                this._loaded = false;
                this.rootDoc.on('subdocs', this._onSubdocEvent);
            }
            return subDoc;
        };
        this._onSubdocEvent = ({ loaded, }) => {
            const result = Array.from(loaded).find(doc => doc.guid === this._ySpaceDoc.guid);
            if (!result) {
                return;
            }
            this.rootDoc.off('subdocs', this._onSubdocEvent);
            this._loaded = true;
        };
        /** Indicate whether the block tree is ready */
        this._ready = false;
        this.id = id;
        this.rootDoc = doc;
        this.awarenessStore = awarenessStore;
        this._ySpaceDoc = this._initSubDoc();
        this._yBlocks = this._ySpaceDoc.getMap('blocks');
        this._collection = collection;
        this._storeContainer = new StoreContainer(this);
    }
    clear() {
        this._yBlocks.clear();
    }
    get removeStore() {
        return this._storeContainer.removeStore;
    }
    _destroy() {
        this._ySpaceDoc.destroy();
        this._loaded = false;
    }
    dispose() {
        if (this.ready) {
            this._yBlocks.clear();
        }
    }
    getStore({ readonly, query, provider, extensions, id, } = {}) {
        const storeExtensions = this.workspace.storeExtensions.concat(extensions ?? []);
        let storeId;
        if (id) {
            storeId = id;
        }
        else if (readonly !== undefined || query) {
            storeId = id;
        }
        else {
            storeId = this.spaceDoc.guid;
        }
        return this._storeContainer.getStore({
            id: storeId,
            readonly,
            query,
            provider,
            extensions: storeExtensions,
        });
    }
    load(initFn) {
        if (this.ready) {
            return this;
        }
        this._ySpaceDoc.load();
        initFn?.();
        this._ready = true;
        return this;
    }
    remove() {
        this._destroy();
        this.rootDoc.getMap('spaces').delete(this.id);
    }
}
