import { type Container } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
import { LifeCycleWatcher } from '../extension/lifecycle-watcher.js';
import type { BlockStdScope } from '../scope/std-scope.js';
import type { SurfaceMiddleware } from './model/surface/surface-model.js';
export declare abstract class SurfaceMiddlewareBuilder extends Extension {
    protected std: BlockStdScope;
    static key: string;
    abstract middleware: SurfaceMiddleware;
    get gfx(): import("./controller.js").GfxController;
    constructor(std: BlockStdScope);
    static setup(di: Container): void;
    mounted(): void;
    unmounted(): void;
}
export declare const SurfaceMiddlewareBuilderIdentifier: import("@blocksuite/global/di").ServiceIdentifier<SurfaceMiddlewareBuilder> & (<U extends SurfaceMiddlewareBuilder = SurfaceMiddlewareBuilder>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class SurfaceMiddlewareExtension extends LifeCycleWatcher {
    static key: string;
    mounted(): void;
}
//# sourceMappingURL=surface-middleware.d.ts.map