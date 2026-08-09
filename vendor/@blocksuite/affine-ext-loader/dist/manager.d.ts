import type { ExtensionType } from '@blocksuite/store';
import type { BaseExtensionProvider, Empty } from './base-provider';
/**
 * A manager class that handles the registration and configuration of extensions
 * for different scopes. It manages extension providers and their instances,
 * allowing for dynamic configuration and extension loading.
 *
 * @typeParam Scope - The type of scope identifiers used for categorizing extensions
 */
export declare class ExtensionManager<Scope extends string> {
    /** @internal */
    protected _extensions: Map<string, Set<ExtensionType>>;
    /** @internal */
    private readonly _providers;
    /** @internal */
    private readonly _providerOptions;
    /** @internal */
    private readonly _providerInstances;
    /**
     * Creates a new ExtensionManager instance with the specified providers.
     *
     * @param providers - Array of extension provider classes to be managed
     */
    constructor(providers: Array<typeof BaseExtensionProvider<Scope>>);
    /** @internal */
    private readonly _build;
    /** @internal */
    private readonly _registerToScope;
    /** @internal */
    private readonly _getContextByScope;
    /**
     * Retrieves all extensions registered for a specific scope.
     * It triggers the build process.
     *
     * @param scope - The scope to retrieve extensions for
     * @returns An array of extensions registered for the specified scope
     * @throws {BlockSuiteError} If the scope is not found
     */
    get(scope: Scope): ExtensionType[];
    /**
     * Configures a specific provider with new options.
     * Can update existing configuration or remove it entirely.
     * Triggers a rebuild of the provider instance when configuration changes.
     *
     * @typeParam T - The type of configuration options for the provider
     * @param provider - The provider class to configure
     * @param options - New configuration options or a function to update existing options
     */
    configure<T extends Empty>(provider: typeof BaseExtensionProvider<Scope, T>, options: ((prev: T | undefined) => T | undefined) | T | undefined): void;
}
//# sourceMappingURL=manager.d.ts.map