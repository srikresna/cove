import type { BlockStdScope, EditorHost } from '@blocksuite/std';
import type { GfxModel } from '@blocksuite/std/gfx';
import type { BlockModel, Store } from '@blocksuite/store';
export declare abstract class MenuContext {
    abstract get doc(): Store;
    get firstElement(): GfxModel | null;
    abstract get host(): EditorHost;
    abstract get selectedBlockModels(): BlockModel[];
    abstract get std(): BlockStdScope;
    close(): void;
    isElement(): boolean;
    abstract isEmpty(): boolean;
    abstract isMultiple(): boolean;
    abstract isSingle(): boolean;
}
//# sourceMappingURL=menu-context.d.ts.map