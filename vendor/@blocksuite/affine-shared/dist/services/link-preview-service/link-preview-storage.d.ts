import { z } from 'zod';
declare const _StorageSchema: z.ZodObject<{
    data: z.ZodRecord<z.ZodString, z.ZodObject<{
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        image?: string | null | undefined;
        description?: string | null | undefined;
        title?: string | null | undefined;
        icon?: string | null | undefined;
    }, {
        image?: string | null | undefined;
        description?: string | null | undefined;
        title?: string | null | undefined;
        icon?: string | null | undefined;
    }>>;
    expires: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, {
        image?: string | null | undefined;
        description?: string | null | undefined;
        title?: string | null | undefined;
        icon?: string | null | undefined;
    }>;
    expires?: number | undefined;
}, {
    data: Record<string, {
        image?: string | null | undefined;
        description?: string | null | undefined;
        title?: string | null | undefined;
        icon?: string | null | undefined;
    }>;
    expires?: number | undefined;
}>;
type StorageData = z.infer<typeof _StorageSchema>;
/**
 * The local storage manager for the link preview cache data
 */
export declare class LinkPreviewStorage {
    /**
     * The storage key for the link preview
     */
    storageKey: string;
    /**
     * Load the cache from local storage
     * @returns StorageData
     */
    load(): StorageData;
    /**
     * Save the cache to local storage
     * @param {StorageData} data
     */
    save(data: StorageData): void;
    /**
     * Clear a link preview record from local storage with specific URL
     * @param {string} url The URL key to remove from storage
     * @returns {boolean} Whether the item was successfully removed
     */
    clearItem(url: string): boolean;
    /**
     * Clear all records from local storage
     */
    clear(): void;
}
export {};
//# sourceMappingURL=link-preview-storage.d.ts.map