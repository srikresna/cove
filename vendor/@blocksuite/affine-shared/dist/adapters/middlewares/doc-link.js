const customDocLinkBaseUrlMiddleware = (baseUrl, collectionId) => {
    return ({ adapterConfigs }) => {
        const docLinkBaseUrl = baseUrl
            ? `${baseUrl}/workspace/${collectionId}`
            : '';
        adapterConfigs.set('docLinkBaseUrl', docLinkBaseUrl);
    };
};
export const docLinkBaseURLMiddlewareBuilder = (baseUrl, collectionId) => {
    let middleware = customDocLinkBaseUrlMiddleware(baseUrl, collectionId);
    return {
        get: () => middleware,
        set: (url) => {
            middleware = customDocLinkBaseUrlMiddleware(url, collectionId);
        },
    };
};
const defaultDocLinkBaseURLMiddlewareBuilder = (collectionId) => docLinkBaseURLMiddlewareBuilder(typeof window !== 'undefined' ? window.location.origin : '.', collectionId);
export const docLinkBaseURLMiddleware = (collectionId) => defaultDocLinkBaseURLMiddlewareBuilder(collectionId).get();
export const setDocLinkBaseURLMiddleware = (collectionId) => defaultDocLinkBaseURLMiddlewareBuilder(collectionId).set;
export const embedSyncedDocMiddleware = (type) => ({ adapterConfigs }) => {
    adapterConfigs.set('embedSyncedDocExportType', type);
};
