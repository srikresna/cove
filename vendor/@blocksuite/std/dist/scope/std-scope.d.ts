import { Container, type ServiceProvider } from '@blocksuite/global/di';
import { type ExtensionType, type Store, StoreSelectionExtension } from '@blocksuite/store';
import { Clipboard } from '../clipboard/index.js';
import { CommandManager } from '../command/index.js';
import { UIEventDispatcher } from '../event/index.js';
import { DndController } from '../extension/dnd/index.js';
import { ServiceManager } from '../extension/service-manager.js';
import { GridManager, LayerManager } from '../gfx/index.js';
import { GfxSelectionManager } from '../gfx/selection.js';
import { SurfaceMiddlewareExtension } from '../gfx/surface-middleware.js';
import { ViewManager } from '../gfx/view/view-manager.js';
import { RangeManager } from '../inline/index.js';
import { EditorHost } from '../view/element/index.js';
import { ViewStore } from '../view/view-store.js';
export interface BlockStdOptions {
    store: Store;
    extensions: ExtensionType[];
}
export declare const internalExtensions: (typeof ServiceManager | typeof RangeManager | typeof ViewStore | typeof UIEventDispatcher | typeof CommandManager | typeof LayerManager | typeof GridManager | typeof GfxSelectionManager | typeof SurfaceMiddlewareExtension | typeof ViewManager)[];
export declare class BlockStdScope {
    static internalExtensions: (typeof ServiceManager | typeof RangeManager | typeof ViewStore | typeof UIEventDispatcher | typeof CommandManager | typeof LayerManager | typeof GridManager | typeof GfxSelectionManager | typeof SurfaceMiddlewareExtension | typeof ViewManager)[];
    readonly container: Container;
    readonly store: Store;
    readonly provider: ServiceProvider;
    readonly userExtensions: ExtensionType[];
    private get _lifeCycleWatchers();
    private _host;
    get dnd(): DndController;
    get clipboard(): Clipboard;
    get workspace(): import("@blocksuite/store").Workspace;
    get command(): CommandManager;
    get event(): UIEventDispatcher;
    get get(): <T>(identifier: import("@blocksuite/global/di").GeneralServiceIdentifier<T>, options?: import("@blocksuite/global/di").ResolveOptions) => T;
    get getOptional(): <T>(identifier: import("@blocksuite/global/di").GeneralServiceIdentifier<T>, options?: import("@blocksuite/global/di").ResolveOptions) => T | null;
    get host(): EditorHost;
    get range(): RangeManager;
    get selection(): StoreSelectionExtension;
    get view(): ViewStore;
    constructor(options: BlockStdOptions);
    getView(flavour: string): import("../index.js").BlockViewType | null;
    mount(): void;
    render(): EditorHost;
    unmount(): void;
}
//# sourceMappingURL=std-scope.d.ts.map