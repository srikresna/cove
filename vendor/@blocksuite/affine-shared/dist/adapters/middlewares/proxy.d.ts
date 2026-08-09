import type { TransformerMiddleware } from '@blocksuite/store';
import { StoreExtension } from '@blocksuite/store';
export declare const customImageProxyMiddleware: (imageProxyURL: string) => TransformerMiddleware;
export declare const isImageProxyURL: (imageUrl: string) => boolean;
export declare const setImageProxyMiddlewareURL: (url: string) => void;
export declare const defaultImageProxyMiddleware: TransformerMiddleware;
export declare class ImageProxyService extends StoreExtension {
    static key: string;
    private _imageProxyURL;
    setImageProxyURL(url: string): void;
    buildUrl(imageUrl: string): string;
    get imageProxyURL(): string;
}
//# sourceMappingURL=proxy.d.ts.map