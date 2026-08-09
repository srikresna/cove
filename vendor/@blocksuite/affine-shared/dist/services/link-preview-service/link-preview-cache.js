import { createIdentifier } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
import debounce from 'lodash-es/debounce';
import QuickLRU from 'quick-lru';
import { z } from 'zod';
import { LinkPreviewStorage } from './link-preview-storage';
export const LinkPreviewCacheConfigSchema = z.object({
    /**
     * The maximum number of items in the cache
     */
    cacheSize: z.number(),
    /**
     * The time to live for the memory cache
     */
    memoryTTL: z.number(),
    /**
     * The time to live for the local storage cache
     */
    localStorageTTL: z.number(),
});
const DEFAULT_LINK_PREVIEW_CACHE_CONFIG = {
    cacheSize: 50,
    memoryTTL: 1000 * 60 * 60, // 60 minutes
    localStorageTTL: 1000 * 60 * 60 * 6, // 6 hours
};
/**
 * It's used to debounce the save to local storage to avoid frequent writes
 */
const DEBOUNCE_TIME = 1000;
export const LinkPreviewCacheIdentifier = createIdentifier('AffineLinkPreviewCache');
/**
 * The link preview cache, it will cache the link preview data in the memory and local storage
 */
export class LinkPreviewCache extends Extension {
    /**
     * The singleton instance of the link preview cache
     */
    static { this.instance = null; }
    constructor(config = DEFAULT_LINK_PREVIEW_CACHE_CONFIG) {
        super();
        this.config = config;
        /**
         * Load the cache from local storage
         */
        this._loadFromStorage = () => {
            const data = this.storage.load();
            // Check if the data is expired
            const localDataExpires = data.expires;
            // If the data is expired, clear the data
            if (localDataExpires && localDataExpires < Date.now()) {
                this.storage.clear();
                return;
            }
            // load the data to the memory cache
            Object.entries(data.data).forEach(([url, item]) => {
                this.memoryCache.set(url, item);
            });
        };
        /**
         * Save the cache to local storage
         * Debounce the save to local storage to avoid frequent writes
         */
        this._saveToStorage = debounce(() => {
            const entries = Array.from(this.memoryCache.entriesDescending());
            const linkPreviewData = Object.fromEntries(entries.slice(0, this.memoryCache.size).map(([url, data]) => [url, data]));
            const data = {
                data: linkPreviewData,
                expires: Date.now() + this.config.localStorageTTL,
            };
            this.storage.save(data);
        }, DEBOUNCE_TIME);
        /**
         * Clear a link preview record from local storage with specific URL
         * Called when the item is evicted from the memory cache
         * @param {string} url The URL key to remove from storage
         * @returns {boolean} Whether the item was successfully removed
         */
        this._clearItemFromStorage = (url) => {
            this.storage.clearItem(url);
        };
        this.storage = new LinkPreviewStorage();
        this.memoryCache = new QuickLRU({
            maxSize: this.config.cacheSize,
            maxAge: this.config.memoryTTL,
            onEviction: key => {
                this._clearItemFromStorage(key);
            },
        });
        this.pendingRequests = new Map();
        this._loadFromStorage();
    }
    static getInstance(config) {
        if (!LinkPreviewCache.instance) {
            LinkPreviewCache.instance = new LinkPreviewCache(config);
        }
        return LinkPreviewCache.instance;
    }
    get(url) {
        return this.memoryCache.get(url);
    }
    set(url, data) {
        this.memoryCache.set(url, data);
        this._saveToStorage();
    }
    getPendingRequest(url) {
        return this.pendingRequests.get(url);
    }
    setPendingRequest(url, promise) {
        this.pendingRequests.set(url, promise);
    }
    deletePendingRequest(url) {
        this.pendingRequests.delete(url);
    }
    clear() {
        this.memoryCache.clear();
        this.pendingRequests.clear();
    }
    clearLocalStorage() {
        this.storage.clear();
    }
    static setup(di) {
        di.addImpl(LinkPreviewCacheIdentifier, () => LinkPreviewCache.getInstance());
    }
}
/**
 * The extension for the link preview cache, it will override the link preview cache instance
 * @param config - The configuration for the link preview cache
 * @returns The extension for the link preview cache
 */
export const LinkPreviewCacheExtension = (config) => {
    return {
        setup: (di) => {
            di.override(LinkPreviewCacheIdentifier, () => LinkPreviewCache.getInstance(config));
        },
    };
};
