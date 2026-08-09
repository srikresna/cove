import type { Doc, GetStoreOptions, RemoveStoreOptions } from '../extension';
import { Store } from './store';
export declare class StoreContainer {
    readonly doc: Doc;
    private readonly _storeMap;
    constructor(doc: Doc);
    getStore: ({ readonly, query, provider, extensions, id, }?: GetStoreOptions) => Store;
    removeStore: ({ readonly, query, id }: RemoveStoreOptions) => void;
    private readonly _getQueryKey;
    private _getReadonlyKey;
}
//# sourceMappingURL=store-container.d.ts.map