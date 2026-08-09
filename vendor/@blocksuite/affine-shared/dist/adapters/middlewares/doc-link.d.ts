import type { TransformerMiddleware } from '@blocksuite/store';
export declare const docLinkBaseURLMiddlewareBuilder: (baseUrl: string, collectionId: string) => {
    get: () => TransformerMiddleware;
    set: (url: string) => void;
};
export declare const docLinkBaseURLMiddleware: (collectionId: string) => TransformerMiddleware;
export declare const setDocLinkBaseURLMiddleware: (collectionId: string) => (url: string) => void;
export declare const embedSyncedDocMiddleware: (type: "content") => TransformerMiddleware;
//# sourceMappingURL=doc-link.d.ts.map