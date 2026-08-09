import { createIdentifier } from '@blocksuite/global/di';
export const surfaceMiddlewareIdentifier = createIdentifier('surface-middleware');
export function surfaceMiddlewareExtension(id, middleware) {
    return {
        setup: di => {
            di.addImpl(surfaceMiddlewareIdentifier(id), {
                middleware,
            });
        },
    };
}
