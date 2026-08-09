import { type Container } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
import type { GfxController } from './controller.js';
export declare const GfxExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<GfxExtension> & (<U extends GfxExtension = GfxExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const GfxClassExtenderIdentifier: import("@blocksuite/global/di").ServiceIdentifier<{
    extendFn: (gfx: GfxController) => void;
}> & (<U extends {
    extendFn: (gfx: GfxController) => void;
} = {
    extendFn: (gfx: GfxController) => void;
}>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare abstract class GfxExtension extends Extension {
    protected readonly gfx: GfxController;
    static key: string;
    get std(): import("../index.js").BlockStdScope;
    constructor(gfx: GfxController);
    static extendGfx(_: GfxController): void;
    static setup(di: Container): void;
    mounted(): void;
    unmounted(): void;
}
//# sourceMappingURL=extension.d.ts.map