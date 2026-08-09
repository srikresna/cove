import { BaseExtensionProvider, } from './base-provider';
/**
 * A specialized extension provider for store-related functionality.
 * Extends the base provider with store-specific scope and configuration.
 *
 * @typeParam Options - The type of configuration options for the store provider
 *
 * @example
 * ```ts
 * // Create a store provider with custom options
 * class MyStoreProvider extends StoreExtensionProvider<{ cacheSize: number }> {
 *   override name = 'MyStoreProvider';
 *
 *   override schema = z.object({
 *     cacheSize: z.number().min(0)
 *   });
 *
 *   override setup(context: StoreExtensionContext, options?: { cacheSize: number }) {
 *     super.setup(context, options);
 *     context.register([Ext1, Ext2, Ext3]);
 *   }
 * }
 * ```
 */
export class StoreExtensionProvider extends BaseExtensionProvider {
    constructor() {
        super(...arguments);
        /** The name of the store extension provider */
        this.name = 'StoreExtension';
    }
}
