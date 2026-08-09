import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import type { GfxModel } from '@blocksuite/std/gfx';
import { Extension, type ExtensionType } from '@blocksuite/store';
import type { ToolbarPlacement } from './config';
import { Flags } from './flags';
import type { ToolbarModule } from './module';
export declare const ToolbarModuleIdentifier: import("@blocksuite/global/di").ServiceIdentifier<ToolbarModule> & (<U extends ToolbarModule = ToolbarModule>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const ToolbarRegistryIdentifier: import("@blocksuite/global/di").ServiceIdentifier<ToolbarRegistryExtension> & (<U extends ToolbarRegistryExtension = ToolbarRegistryExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function ToolbarModuleExtension(module: ToolbarModule): ExtensionType;
export declare class ToolbarRegistryExtension extends Extension {
    readonly std: BlockStdScope;
    flavour$: import("@preact/signals-core").Signal<string>;
    elementsMap$: import("@preact/signals-core").Signal<Map<string, GfxModel[]>>;
    message$: import("@preact/signals-core").Signal<{
        flavour: string;
        element: Element;
        setFloating: (element?: Element) => void;
    } | null>;
    placement$: import("@preact/signals-core").Signal<ToolbarPlacement>;
    flags: Flags;
    constructor(std: BlockStdScope);
    get modules(): Map<string, ToolbarModule>;
    getModuleBy(flavour: string): import("./config").ToolbarModuleConfig | null;
    getModulePlacement(flavour: string, fallback?: ToolbarPlacement): ToolbarPlacement;
    static setup(di: Container): void;
}
//# sourceMappingURL=registry.d.ts.map