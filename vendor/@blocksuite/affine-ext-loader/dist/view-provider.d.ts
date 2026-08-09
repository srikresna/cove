import { BaseExtensionProvider, type Context, type Empty } from './base-provider';
/**
 * Available view scopes for view-related extensions.
 * Defines the different types of views where extensions can be applied.
 */
export type ViewScope = 'page' | 'edgeless' | 'preview-page' | 'preview-edgeless' | 'mobile-page' | 'mobile-edgeless';
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
export declare class ViewExtensionProvider<Options extends object = Empty> extends BaseExtensionProvider<ViewScope, Options> {
    /** The name of the view extension provider */
    name: string;
    /**
     * Static flag to ensure effect is only run once per provider class
     * @internal
     */
    static effectRan: boolean;
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
    effect(): void;
    /**
     * Check if the scope is edgeless
     * @param scope - The scope to check
     * @returns True if the scope is edgeless, false otherwise
     */
    isEdgeless: (scope: ViewScope) => scope is "edgeless" | "preview-edgeless" | "mobile-edgeless";
    /**
     * Check if the scope is preview
     * @param scope - The scope to check
     * @returns True if the scope is preview, false otherwise
     */
    isPreview: (scope: ViewScope) => scope is "preview-page" | "preview-edgeless";
    /**
     * Check if the scope is mobile
     * @param scope - The scope to check
     * @returns True if the scope is mobile, false otherwise
     */
    isMobile: (scope: ViewScope) => scope is "mobile-page" | "mobile-edgeless";
    setup(context: ViewExtensionContext, options?: Options): void;
}
/**
 * Context type specifically for view-related extensions.
 * Provides type safety for view extension registration and setup.
 */
export type ViewExtensionContext = Context<ViewScope>;
//# sourceMappingURL=view-provider.d.ts.map