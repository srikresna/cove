import { DocIdentifier } from '../extension/workspace';
import { Store } from './store';
export class StoreContainer {
    constructor(doc) {
        this.doc = doc;
        this._storeMap = new Map();
        this.getStore = ({ readonly, query, provider, extensions, id, } = {}) => {
            let idOrOptions;
            if (readonly || query) {
                idOrOptions = { readonly, query };
            }
            else if (!id) {
                idOrOptions = this.doc.workspace.idGenerator();
            }
            else {
                idOrOptions = id;
            }
            const key = this._getQueryKey(idOrOptions);
            if (this._storeMap.has(key)) {
                return this._storeMap.get(key);
            }
            const storeExtension = {
                setup: di => {
                    di.addImpl(DocIdentifier, () => this.doc);
                },
            };
            const doc = new Store({
                doc: this.doc,
                readonly,
                query,
                provider,
                extensions: [storeExtension].concat(extensions ?? []),
            });
            this._storeMap.set(key, doc);
            return doc;
        };
        this.removeStore = ({ readonly, query, id }) => {
            let idOrOptions;
            if (readonly || query) {
                idOrOptions = { readonly, query };
            }
            else if (!id) {
                return;
            }
            else {
                idOrOptions = id;
            }
            const key = this._getQueryKey(idOrOptions);
            this._storeMap.delete(key);
        };
        this._getQueryKey = (idOrOptions) => {
            if (typeof idOrOptions === 'string') {
                return idOrOptions;
            }
            const { readonly, query } = idOrOptions;
            const readonlyKey = this._getReadonlyKey(readonly);
            const key = JSON.stringify({
                readonlyKey,
                query,
            });
            return key;
        };
    }
    _getReadonlyKey(readonly) {
        return readonly?.toString() ?? 'false';
    }
}
