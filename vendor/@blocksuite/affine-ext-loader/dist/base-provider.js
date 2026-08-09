import { z } from 'zod';
/**
 * Base class for all extension providers.
 * Provides common functionality for managing extensions and validating options.
 *
 * @typeParam Scope - The type of scope identifiers used for categorizing extensions
 * @typeParam Options - The type of configuration options for the provider
 *
 * @example
 * ```ts
 * class MyProvider extends BaseExtensionProvider<'my-scope', { enabled: boolean }> {
 *   name = 'MyProvider';
 *
 *   schema = z.object({
 *     enabled: z.boolean()
 *   });
 *
 *   setup(context: Context<'my-scope'>, options?: { enabled: boolean }) {
 *     super.setup(context, options);
 *     // Custom setup logic
 *   }
 * }
 * ```
 */
export class BaseExtensionProvider {
    constructor() {
        /** The name of the provider */
        this.name = 'BaseExtension';
        /** Zod schema for validating provider options */
        this.schema = z.object({});
    }
    /**
     * Sets up the provider with the given context and options.
     * Validates the options against the schema if provided.
     *
     * @param context - The context object containing scope and registration function
     * @param option - Optional configuration options for the provider
     */
    setup(_context, option) {
        if (option) {
            this.schema.parse(option);
        }
    }
}
