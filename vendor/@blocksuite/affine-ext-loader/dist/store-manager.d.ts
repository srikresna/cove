import type { ExtensionType } from '@blocksuite/store';
import { ExtensionManager } from './manager';
/**
 * Identifier for the StoreExtensionManager that can be used for dependency injection.
 */
export declare const StoreExtensionManagerIdentifier: import("@blocksuite/global/di").ServiceIdentifier<StoreExtensionManager> & (<U extends StoreExtensionManager = StoreExtensionManager>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
/**
 * A specialized extension manager for store-related extensions.
 * Extends the base ExtensionManager to provide store-specific functionality.
 *
 * This manager is responsible for handling store-related extensions and ensuring
 * proper dependency injection setup for store components.
 *
 * @example
 * ```ts
 * // Create a store extension manager with providers
 * const manager = new StoreExtensionManager([MyStoreProvider]);
 *
 * // Configure provider options
 * manager.configure(MyStoreProvider, { option1: 'value' });
 *
 * // Get store extensions
 * const extensions = manager.get('store');
 * ```
 */
export declare class StoreExtensionManager extends ExtensionManager<'store'> {
    /**
     * Retrieves store extensions and adds self-registration functionality.
     *
     * @param scope - The scope of extensions to retrieve, must be 'store'
     * @returns An array of extensions including the self-registration extension
     */
    get(scope: 'store'): ExtensionType[];
}
//# sourceMappingURL=store-manager.d.ts.map