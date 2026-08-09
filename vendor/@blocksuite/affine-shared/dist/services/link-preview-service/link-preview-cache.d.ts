import type { LinkPreviewData } from '@blocksuite/affine-model';
import { type Container } from '@blocksuite/global/di';
import { Extension, type ExtensionType } from '@blocksuite/store';
import { z } from 'zod';
export declare const LinkPreviewCacheConfigSchema: z.ZodObject<{
    /**
     * The maximum number of items in the cache
     */
    cacheSize: z.ZodNumber;
    /**
     * The time to live for the memory cache
     */
    memoryTTL: z.ZodNumber;
    /**
     * The time to live for the local storage cache
     */
    localStorageTTL: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    cacheSize: number;
    memoryTTL: number;
    localStorageTTL: number;
}, {
    cacheSize: number;
    memoryTTL: number;
    localStorageTTL: number;
}>;
export type LinkPreviewCacheConfig = z.infer<typeof LinkPreviewCacheConfigSchema>;
/**
 * The interface for the link preview cache provider
 */
export interface LinkPreviewCacheProvider {
    /**
     * Get the link preview data for a given URL
     * @param url The URL to get the link preview data for
     * @returns The link preview data for the given URL
     */
    get(url: string): Partial<LinkPreviewData> | undefined;
    /**
     * Set the link preview data for a given URL
     * @param url The URL to set the link preview data for
     * @param data The link preview data to set
     */
    set(url: string, data: Partial<LinkPreviewData>): void;
    /**
     * Get the pending request for a given URL
     * @param url The URL to get the pending request for
     * @returns The pending request for the given URL
     */
    getPendingRequest(url: string): Promise<Partial<LinkPreviewData>> | undefined;
    /**
     * Set the pending request for a given URL
     * @param url The URL to set the pending request for
     * @param promise The promise to set for the given URL
     */
    setPendingRequest(url: string, promise: Promise<Partial<LinkPreviewData>>): void;
    /**
     * Delete the pending request for a given URL
     * @param url The URL to delete the pending request for
     */
    deletePendingRequest(url: string): void;
    /**
     * Clear the cache
     */
    clear(): void;
}
export declare const LinkPreviewCacheIdentifier: import("@blocksuite/global/di").ServiceIdentifier<LinkPreviewCacheProvider> & (<U extends LinkPreviewCacheProvider = LinkPreviewCacheProvider>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
/**
 * The link preview cache, it will cache the link preview data in the memory and local storage
 */
export declare class LinkPreviewCache extends Extension implements LinkPreviewCacheProvider {
    private readonly config;
    /**
     * The singleton instance of the link preview cache
     */
    private static instance;
    /**
     * The memory cache for the link preview
     */
    private readonly memoryCache;
    /**
     * The pending requests for the link preview
     * The promise will be resolved when the data is fetched
     */
    private readonly pendingRequests;
    /**
     * The local storage manager for the link preview
     */
    private readonly storage;
    constructor(config?: LinkPreviewCacheConfig);
    static getInstance(config?: LinkPreviewCacheConfig): LinkPreviewCache;
    get(url: string): Partial<LinkPreviewData> | undefined;
    set(url: string, data: Partial<LinkPreviewData>): void;
    getPendingRequest(url: string): Promise<Partial<LinkPreviewData>> | undefined;
    setPendingRequest(url: string, promise: Promise<Partial<LinkPreviewData>>): void;
    deletePendingRequest(url: string): void;
    /**
     * Load the cache from local storage
     */
    private readonly _loadFromStorage;
    /**
     * Save the cache to local storage
     * Debounce the save to local storage to avoid frequent writes
     */
    private readonly _saveToStorage;
    /**
     * Clear a link preview record from local storage with specific URL
     * Called when the item is evicted from the memory cache
     * @param {string} url The URL key to remove from storage
     * @returns {boolean} Whether the item was successfully removed
     */
    private readonly _clearItemFromStorage;
    clear(): void;
    clearLocalStorage(): void;
    static setup(di: Container): void;
}
/**
 * The extension for the link preview cache, it will override the link preview cache instance
 * @param config - The configuration for the link preview cache
 * @returns The extension for the link preview cache
 */
export declare const LinkPreviewCacheExtension: (config?: LinkPreviewCacheConfig) => ExtensionType;
//# sourceMappingURL=link-preview-cache.d.ts.map