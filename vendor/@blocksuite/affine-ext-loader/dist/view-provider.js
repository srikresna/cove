import { BaseExtensionProvider, } from './base-provider';
/**
 * A specialized extension provider for view-related functionality.
 * Extends the base provider with view-specific scope and configuration.
 *
 * @typeParam Options - The type of configuration options for the view provider
 *
 * @example
 * ```ts
 * // Create a view provider with custom options
 * class MyViewProvider extends ViewExtensionProvider<{ theme: string }> {
 *   override name = 'MyViewProvider';
 *
 *   override schema = z.object({
 *     theme: z.enum(['light', 'dark'])
 *   });
 *
 *   override setup(context: ViewExtensionContext, options?: { theme: string }) {
 *     super.setup(context, options);
 *
 *     context.register([CommonExt]);
 *     if (context.scope === 'page') {
 *       context.register([PageExt]);
 *     } else if (context.scope === 'edgeless') {
 *       context.register([EdgelessExt]);
 *     }
 *     if (options?.theme === 'dark') {
 *       context.register([DarkModeExt]);
 *     }
 *   }
 *
 *   // Override effect to run one-time initialization logic
 *   override effect() {
 *     // This will only run once per provider class
 *     console.log('Initializing MyViewProvider');
 *   }
 * }
 * ```
 */
export class ViewExtensionProvider extends BaseExtensionProvider {
    constructor() {
        super(...arguments);
        /** The name of the view extension provider */
        this.name = 'ViewExtension';
        /**
         * Check if the scope is edgeless
         * @param scope - The scope to check
         * @returns True if the scope is edgeless, false otherwise
         */
        this.isEdgeless = (scope) => {
            return (scope === 'edgeless' ||
                scope === 'preview-edgeless' ||
                scope === 'mobile-edgeless');
        };
        /**
         * Check if the scope is preview
         * @param scope - The scope to check
         * @returns True if the scope is preview, false otherwise
         */
        this.isPreview = (scope) => {
            return scope === 'preview-page' || scope === 'preview-edgeless';
        };
        /**
         * Check if the scope is mobile
         * @param scope - The scope to check
         * @returns True if the scope is mobile, false otherwise
         */
        this.isMobile = (scope) => {
            return scope === 'mobile-page' || scope === 'mobile-edgeless';
        };
    }
    /**
     * Static flag to ensure effect is only run once per provider class
     * @internal
     */
    static { this.effectRan = false; }
    /**
     * Override this method to implement one-time initialization logic for the provider.
     * This method will be called automatically during setup, but only once per provider class.
     *
     * @example
     * ```ts
     * override effect() {
     *   super.effect();
     *   // Register lit elements
     *   registerLitElements();
     * }
     * ```
     */
    effect() { }
    setup(context, options) {
        super.setup(context, options);
        const constructor = this.constructor;
        if (!constructor.effectRan) {
            constructor.effectRan = true;
            this.effect();
        }
    }
}
