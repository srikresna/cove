import { type ServiceIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';
/**
 * The options for the iframe
 * @example
 * {
 *   widthInSurface: 640,
 *   heightInSurface: 152,
 *   heightInNote: 152,
 *   widthPercent: 100,
 *   style: 'border-radius: 12px;',
 *   allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
 * }
 */
export type IframeOptions = {
    widthInSurface: number;
    heightInSurface: number;
    heightInNote: number;
    widthPercent: number;
    style?: string;
    referrerpolicy?: string;
    scrolling?: boolean;
    allow?: string;
    allowFullscreen?: boolean;
    containerBorderRadius?: number;
    sandbox?: string;
};
/**
 * Define the config of an embed iframe block
 * @example
 * {
 *   name: 'spotify',
 *   match: (url: string) => spotifyRegex.test(url),
 *   buildOEmbedUrl: (url: string) => {
 *     const match = url.match(spotifyRegex);
 *     if (!match) {
 *       return undefined;
 *     }
 *     const encodedUrl = encodeURIComponent(url);
 *     const oEmbedUrl = `${spotifyEndpoint}?url=${encodedUrl}`;
 *     return oEmbedUrl;
 *   },
 *   useOEmbedUrlDirectly: false,
 *   options: {
 *     defaultWidth: '100%',
 *     defaultHeight: '152px',
 *     allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
 *   }
 * }
 */
export type EmbedIframeConfig = {
    /**
     * The name of the embed iframe block
     */
    name: string;
    /**
     * The function to match the url
     */
    match: (url: string) => boolean;
    /**
     * The function to build the oEmbed URL for fetching embed data
     */
    buildOEmbedUrl: (url: string) => string | undefined;
    /**
     * Validate the final iframe src before rendering.
     */
    validateIframeUrl?: (iframeUrl: string, originalUrl?: string) => boolean;
    /**
     * Use oEmbed URL directly as iframe src without fetching oEmbed data
     */
    useOEmbedUrlDirectly: boolean;
    /**
     * The options for the iframe
     */
    options?: IframeOptions;
};
export declare const EmbedIframeConfigIdentifier: ServiceIdentifier<EmbedIframeConfig> & (<U extends EmbedIframeConfig = EmbedIframeConfig>(variant: import("@blocksuite/global/di").ServiceVariant) => ServiceIdentifier<U>);
export declare function EmbedIframeConfigExtension(config: EmbedIframeConfig): ExtensionType & {
    identifier: ServiceIdentifier<EmbedIframeConfig>;
};
//# sourceMappingURL=embed-iframe-config.d.ts.map