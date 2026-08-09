var _a;
import { createIdentifier } from '@blocksuite/global/di';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { StoreIdentifier } from '../model/store/identifier';
import { Extension } from './extension';
export const StoreExtensionIdentifier = createIdentifier('StoreExtension');
export const storeExtensionSymbol = Symbol('StoreExtension');
/**
 * Store extensions are used to extend the store.
 * They should be registered to the store. And they should be able to run in a none-dom environment.
 *
 * @category Extension
 */
export class StoreExtension extends Extension {
    static { _a = storeExtensionSymbol; }
    constructor(store) {
        super();
        this.store = store;
    }
    /**
     * Lifecycle hook when the yjs document is loaded.
     */
    loaded() { }
    /**
     * Lifecycle hook when the yjs document is disposed.
     */
    disposed() { }
    static { this[_a] = true; }
    static setup(di) {
        if (!this.key) {
            throw new BlockSuiteError(ErrorCode.ValueNotExists, 'Key is not defined in the StoreExtension');
        }
        di.add(this, [StoreIdentifier]);
        di.addImpl(StoreExtensionIdentifier(this.key), provider => provider.get(this));
    }
}
export function isStoreExtensionConstructor(extension) {
    return storeExtensionSymbol in extension;
}
