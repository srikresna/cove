import { type Container } from '@blocksuite/global/di';
import type { Store } from '../model/store';
import { Extension } from './extension';
export declare const StoreExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<StoreExtension> & (<U extends StoreExtension = StoreExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const storeExtensionSymbol: unique symbol;
/**
 * Store extensions are used to extend the store.
 * They should be registered to the store. And they should be able to run in a none-dom environment.
 *
 * @category Extension
 */
export declare class StoreExtension extends Extension {
    readonly store: Store;
    /**
     * The key of the store extension.
     * **You must override this property with a unique string.**
     */
    static readonly key: string;
    constructor(store: Store);
    /**
     * Lifecycle hook when the yjs document is loaded.
     */
    loaded(): void;
    /**
     * Lifecycle hook when the yjs document is disposed.
     */
    disposed(): void;
    static readonly [storeExtensionSymbol] = true;
    static setup(di: Container): void;
}
export declare function isStoreExtensionConstructor(extension: object): extension is typeof StoreExtension;
//# sourceMappingURL=store-extension.d.ts.map