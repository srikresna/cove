import type { EmbedIframeBlockProps } from '@blocksuite/affine-model';
import { type Store, StoreExtension } from '@blocksuite/store';
import { type EmbedIframeConfig } from './embed-iframe-config';
export type EmbedIframeData = {
    html?: string;
    iframe_url?: string;
    width?: number | string;
    height?: number | string;
    title?: string;
    description?: string;
    provider_name?: string;
    provider_url?: string;
    version?: string;
    thumbnail_url?: string;
    thumbnail_width?: number;
    thumbnail_height?: number;
    type?: string;
};
/**
 * Service for handling embeddable URLs
 */
export interface EmbedIframeProvider {
    /**
     * Check if a URL can be embedded
     * @param url URL to check
     * @returns true if the URL can be embedded, false otherwise
     */
    canEmbed: (url: string) => boolean;
    /**
     * Build a API URL for fetching embed data
     * @param url URL to build API URL
     * @returns API URL if the URL can be embedded, undefined otherwise
     */
    buildOEmbedUrl: (url: string) => string | undefined;
    /**
     * Get the embed iframe config
     * @param url URL to get embed iframe config
     * @returns Embed iframe config if the URL can be embedded, undefined otherwise
     */
    getConfig: (url: string) => EmbedIframeConfig | undefined;
    /**
     * Get embed iframe data
     * @param url URL to get embed iframe data
     * @returns Embed iframe data if the URL can be embedded, undefined otherwise
     */
    getEmbedIframeData: (url: string) => Promise<EmbedIframeData | null>;
    /**
     * Parse an embeddable URL and add an EmbedIframeBlock to doc
     * @param url Original url to embed
     * @param parentId Parent block ID
     * @param index Optional index to insert at
     * @returns Created block id if successful, undefined if the URL cannot be embedded
     */
    addEmbedIframeBlock: (props: Partial<EmbedIframeBlockProps>, parentId: string, index?: number) => string | undefined;
}
export declare class EmbedIframeService extends StoreExtension implements EmbedIframeProvider {
    static key: string;
    private readonly _configs;
    constructor(store: Store);
    canEmbed: (url: string) => boolean;
    buildOEmbedUrl: (url: string) => string | undefined;
    getConfig: (url: string) => EmbedIframeConfig | undefined;
    getEmbedIframeData: (url: string, signal?: AbortSignal) => Promise<EmbedIframeData | null>;
    addEmbedIframeBlock: (props: Partial<EmbedIframeBlockProps>, parentId: string, index?: number) => string | undefined;
}
//# sourceMappingURL=embed-iframe-service.d.ts.map