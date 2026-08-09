import type { ExtensionType } from '@blocksuite/store';
import { ExtensionManager } from './manager';
import type { ViewScope } from './view-provider';
/**
 * Identifier for the ViewExtensionManager that can be used for dependency injection.
 */
export declare const ViewExtensionManagerIdentifier: import("@blocksuite/global/di").ServiceIdentifier<ViewExtensionManager> & (<U extends ViewExtensionManager = ViewExtensionManager>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
/**
 * A specialized extension manager for view-related extensions.
 * Extends the base ExtensionManager to provide view-specific functionality.
 *
 * This manager is responsible for handling view-related extensions and ensuring
 * proper dependency injection setup for view components.
 *
 * @example
 * ```ts
 * // Create a view extension manager with providers
 * const manager = new ViewExtensionManager([MyViewProvider]);
 *
 * // Configure provider options
 * manager.configure(MyViewProvider, { option1: 'value' });
 *
 * // Get view extensions for a specific scope
 * const pageExtensions = manager.get('page');
 * const edgelessExtensions = manager.get('edgeless');
 * ```
 */
export declare class ViewExtensionManager extends ExtensionManager<ViewScope> {
    /**
     * Retrieves view extensions and adds self-registration functionality.
     *
     * @param scope - The scope of extensions to retrieve
     * @returns An array of extensions including the self-registration extension
     */
    get(scope: ViewScope): ExtensionType[];
}
//# sourceMappingURL=view-manager.d.ts.map