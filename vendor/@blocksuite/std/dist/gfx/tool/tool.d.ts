import { type Container } from '@blocksuite/global/di';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { Extension } from '@blocksuite/store';
import type { PointerEventState } from '../../event/index.js';
import type { GfxController } from '../controller.js';
import type { ToolEventTarget } from './tool-controller.js';
export declare abstract class BaseTool<Option = Record<string, unknown>> extends Extension {
    readonly gfx: GfxController;
    static toolName: string;
    private readonly eventTarget;
    activatedOption: Option;
    addHook: ToolEventTarget['addHook'];
    /**
     * The `disposable` will be disposed when the tool is unloaded.
     */
    protected readonly disposable: DisposableGroup;
    get active(): boolean;
    get allowDragWithRightButton(): boolean;
    get controller(): import("./tool-controller.js").ToolController;
    get doc(): import("@blocksuite/store").Store;
    get std(): import("../../index.js").BlockStdScope;
    get toolName(): string;
    constructor(gfx: GfxController);
    static setup(di: Container): void;
    /**
     * Called when the tool is activated.
     * @param _ - The data passed as second argument when calling `ToolController.use`.
     */
    activate(_: Option): void;
    click(_: PointerEventState): void;
    contextMenu(_: PointerEventState): void;
    /**
     * Called when the tool is deactivated.
     */
    deactivate(): void;
    doubleClick(_: PointerEventState): void;
    dragEnd(_: PointerEventState): void;
    dragMove(_: PointerEventState): void;
    dragStart(_: PointerEventState): void;
    /**
     * Called when the tool is registered.
     */
    mounted(): void;
    pointerDown(_: PointerEventState): void;
    pointerMove(_: PointerEventState): void;
    pointerOut(_: PointerEventState): void;
    pointerUp(_: PointerEventState): void;
    tripleClick(_: PointerEventState): void;
    /**
     * Called when the tool is unloaded, usually when the whole `ToolController` is destroyed.
     */
    unmounted(): void;
}
export declare const ToolIdentifier: import("@blocksuite/global/di").ServiceIdentifier<BaseTool<Record<string, unknown>>> & (<U extends BaseTool<Record<string, unknown>> = BaseTool<Record<string, unknown>>>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export type ToolType<T extends BaseTool = BaseTool> = {
    new (gfx: GfxController): T;
    toolName: string;
};
export type ToolOptions<T extends BaseTool> = T extends BaseTool<infer O> ? O : never;
export type ToolOptionWithType<T extends BaseTool = BaseTool> = {
    toolType?: ToolType<T>;
    options?: ToolOptions<T>;
};
//# sourceMappingURL=tool.d.ts.map