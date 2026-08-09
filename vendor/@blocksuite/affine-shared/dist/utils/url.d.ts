export declare function normalizeUrl(str: string): string;
/**
 * Assume user will input a url, we just need to check if it is valid.
 *
 * For more detail see https://www.ietf.org/rfc/rfc1738.txt
 */
export declare function isValidUrl(str: string, baseUrl?: string): boolean;
export type UrlTextSegment = {
    text: string;
    link?: string;
};
/**
 * Split plain text into mixed segments, where only URL segments carry link metadata.
 * This is used by paste handlers so text like `example:https://google.com` keeps
 * normal text while only URL parts are linkified.
 */
export declare function splitTextByUrl(text: string, baseUrl?: string): UrlTextSegment[];
/**
 * Assuming the user will input anything, we need to check rigorously.
 */
export declare function isStrictUrl(str: string): boolean;
export declare function isUrlInClipboard(clipboardData: DataTransfer): boolean;
export declare function getHostName(link: string): string;
//# sourceMappingURL=url.d.ts.map