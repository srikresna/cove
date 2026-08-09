import { BlockComponent, type BlockStdScope } from '@blocksuite/std';
import { type GfxElementModelView, type GfxModel } from '@blocksuite/std/gfx';
import type { BaseSelection, BlockModel, SelectionConstructor } from '@blocksuite/store';
import { DocModeProvider } from '../doc-mode-service';
import { EditPropsStore } from '../edit-props-store';
import { FeatureFlagService } from '../feature-flag-service';
import { type TelemetryService } from '../telemetry-service';
declare abstract class ToolbarContextBase {
    readonly std: BlockStdScope;
    constructor(std: BlockStdScope);
    get command(): import("@blocksuite/std").CommandManager;
    get chain(): import("@blocksuite/std").Chain<import("@blocksuite/std").InitCommandCtx>;
    get doc(): import("@blocksuite/store").Doc;
    get workspace(): import("@blocksuite/store").Workspace;
    get host(): import("@blocksuite/std").EditorHost;
    get clipboard(): import("@blocksuite/std").Clipboard;
    get selection(): import("@blocksuite/store").StoreSelectionExtension;
    get store(): import("@blocksuite/store").Store;
    get history(): import("yjs").UndoManager;
    get view(): import("@blocksuite/std").ViewStore;
    get activated(): boolean;
    get readonly(): boolean;
    get docModeProvider(): DocModeProvider;
    get editorMode(): import("@blocksuite/affine-model").DocMode;
    get isPageMode(): boolean;
    get isEdgelessMode(): boolean;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    get theme(): import("..").ThemeService;
    get settings(): EditPropsStore;
    get features(): FeatureFlagService;
    get toolbarRegistry(): import("./registry").ToolbarRegistryExtension;
    get flags(): import("./flags").Flags;
    get flavour$(): import("@preact/signals-core").Signal<string>;
    get placement$(): import("@preact/signals-core").Signal<import("./config").ToolbarPlacement>;
    get message$(): import("@preact/signals-core").Signal<{
        flavour: string;
        element: Element;
        setFloating: (element?: Element) => void;
    } | null>;
    get elementsMap$(): import("@preact/signals-core").Signal<Map<string, GfxModel[]>>;
    get hasSelectedSurfaceModels(): boolean;
    getSurfaceModels(): GfxModel[];
    getSurfaceModelsByType<T extends abstract new (...args: any) => any>(klass: T): InstanceType<T>[];
    getSurfaceBlocksByType<T extends abstract new (...args: any) => any>(klass: T): (GfxElementModelView<import("@blocksuite/std/gfx").GfxPrimitiveElementModel<import("@blocksuite/std/gfx").BaseElementProps> | import("@blocksuite/std/gfx").GfxLocalElementModel, object> | import("@blocksuite/std").GfxBlockComponent<import("@blocksuite/std/gfx").GfxBlockElementModel<import("@blocksuite/std/gfx").GfxCompatibleProps>, import("@blocksuite/std").BlockService, string> | null)[];
    getCurrentBlockBy<T extends SelectionConstructor>(type: T): BlockComponent<any, any, any> | GfxElementModelView<import("@blocksuite/std/gfx").GfxPrimitiveElementModel<import("@blocksuite/std/gfx").BaseElementProps> | import("@blocksuite/std/gfx").GfxLocalElementModel, object> | null;
    getCurrentBlock(): BlockComponent<any, any, any> | GfxElementModelView<import("@blocksuite/std/gfx").GfxPrimitiveElementModel<import("@blocksuite/std/gfx").BaseElementProps> | import("@blocksuite/std/gfx").GfxLocalElementModel, object> | null;
    getCurrentBlockByType<T extends abstract new (...args: any) => any>(klass: T): InstanceType<T> | null;
    matchBlock<T extends abstract new (...args: any) => any>(component: GfxElementModelView | BlockComponent | null, klass: T): component is InstanceType<T>;
    getCurrentModelBy<T extends SelectionConstructor>(type: T): any;
    getCurrentModel(): GfxModel | BlockModel | null;
    getCurrentModelByType<T extends abstract new (...args: any) => any>(klass: T): InstanceType<T> | null;
    matchModel<T extends abstract new (...args: any) => any>(model: GfxModel | BlockModel | null, klass: T): model is InstanceType<T>;
    select(group: string, selections?: BaseSelection[]): void;
    show(): void;
    hide(): void;
    reset(): void;
    get telemetryProvider(): TelemetryService | null;
    track: (...[name, props]: Parameters<TelemetryService["track"]>) => void;
}
export declare class ToolbarContext extends ToolbarContextBase {
}
export {};
//# sourceMappingURL=context.d.ts.map