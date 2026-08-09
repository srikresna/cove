import { StoreExtension } from '@blocksuite/store';
import { DEFAULT_IMAGE_PROXY_ENDPOINT } from '../../consts';
export const customImageProxyMiddleware = (imageProxyURL) => {
    return ({ adapterConfigs }) => {
        adapterConfigs.set('imageProxy', imageProxyURL);
    };
};
const imageProxyMiddlewareBuilder = () => {
    let middleware = customImageProxyMiddleware(DEFAULT_IMAGE_PROXY_ENDPOINT);
    return {
        get: () => middleware,
        set: (url) => {
            middleware = customImageProxyMiddleware(url);
        },
    };
};
const IMAGE_PROXY_PATH = '/api/worker/image-proxy';
export const isImageProxyURL = (imageUrl) => {
    try {
        const url = new URL(imageUrl, globalThis.location.origin);
        return url.pathname === IMAGE_PROXY_PATH && url.searchParams.has('url');
    }
    catch {
        return false;
    }
};
const defaultImageProxyMiddlewarBuilder = imageProxyMiddlewareBuilder();
export const setImageProxyMiddlewareURL = defaultImageProxyMiddlewarBuilder.set;
export const defaultImageProxyMiddleware = args => {
    return defaultImageProxyMiddlewarBuilder.get()(args);
};
// TODO(@mirone): this should be configured when setup instead of runtime
export class ImageProxyService extends StoreExtension {
    constructor() {
        super(...arguments);
        this._imageProxyURL = DEFAULT_IMAGE_PROXY_ENDPOINT;
    }
    static { this.key = 'image-proxy'; }
    setImageProxyURL(url) {
        this._imageProxyURL = url;
        setImageProxyMiddlewareURL(url);
    }
    buildUrl(imageUrl) {
        if (imageUrl.startsWith(this.imageProxyURL) || isImageProxyURL(imageUrl)) {
            return imageUrl;
        }
        return `${this.imageProxyURL}?url=${encodeURIComponent(imageUrl)}`;
    }
    get imageProxyURL() {
        return this._imageProxyURL;
    }
}
