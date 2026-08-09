import type { BlockStdScope } from '@blocksuite/std';
/**
 * The options for the embed iframe url validation
 */
export interface EmbedIframeUrlValidationOptions {
    protocols: string[];
    hostnames: string[];
}
/**
 * Validate the url is allowed to embed in the iframe
 * @param url URL to validate
 * @param options Validation options
 * @returns Whether the url is valid
 */
export declare function validateEmbedIframeUrl(url: string, options: EmbedIframeUrlValidationOptions): boolean;
/**
 * Safely extracts the src URL from an iframe HTML string
 * @param htmlString The iframe HTML string to parse
 * @param options Optional validation configuration
 * @returns The validated src URL or undefined if validation fails
 */
export declare function safeGetIframeSrc(htmlString: string): string | undefined;
/**
 * Check if the url can be embedded as an iframe
 * @param std The block std scope
 * @param url The url to check
 * @returns Whether the url can be embedded as an iframe
 */
export declare function canEmbedAsIframe(std: BlockStdScope, url: string): boolean;
//# sourceMappingURL=utils.d.ts.map