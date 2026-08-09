import { type LinkPreviewData } from '@blocksuite/affine-model';
import { type Container } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
import { type LinkPreviewCacheProvider } from './link-preview-cache';
export type LinkPreviewResponseData = {
    url: string;
    title?: string;
    siteName?: string;
    description?: string;
    images?: string[];
    mediaType?: string;
    contentType?: string;
    charset?: string;
    videos?: string[];
    favicons?: string[];
};
export interface LinkPreviewProvider {
    /**
     * Query link preview data for a given URL
     */
    query: (url: string, signal?: AbortSignal) => Promise<Partial<LinkPreviewData>>;
    /**
     * Set the endpoint for link preview
     */
    setEndpoint: (endpoint: string) => void;
    /**
     * Get the endpoint for link preview
     */
    endpoint: string;
}
export declare const LinkPreviewServiceIdentifier: import("@blocksuite/global/di").ServiceIdentifier<LinkPreviewProvider> & (<U extends LinkPreviewProvider = LinkPreviewProvider>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class LinkPreviewService extends Extension implements LinkPreviewProvider {
    private readonly _cache;
    static setup(di: Container): void;
    private _endpoint;
    constructor(_cache: LinkPreviewCacheProvider);
    get endpoint(): string;
    setEndpoint: (endpoint: string) => void;
    private readonly _fetchTwitterPreview;
    private readonly _fetchStandardPreview;
    private readonly _isTwitterUrl;
    private readonly _fetchPreview;
    /**
     * Fetch link preview data for a given URL
     */
    query: (url: string, signal?: AbortSignal) => Promise<Partial<LinkPreviewData>>;
}
//# sourceMappingURL=link-preview-service.d.ts.map