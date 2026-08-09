import type { ExtensionType } from '@blocksuite/store';
import type { SurfaceBlockModel } from '../surface-model';
export type SurfaceMiddleware = (surface: SurfaceBlockModel) => () => void;
export declare const surfaceMiddlewareIdentifier: import("@blocksuite/global/di").ServiceIdentifier<{
    middleware: SurfaceMiddleware;
}> & (<U extends {
    middleware: SurfaceMiddleware;
} = {
    middleware: SurfaceMiddleware;
}>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function surfaceMiddlewareExtension(id: string, middleware: SurfaceMiddleware): ExtensionType;
//# sourceMappingURL=surface-middleware.d.ts.map