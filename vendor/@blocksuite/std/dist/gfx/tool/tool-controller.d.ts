import type { ServiceIdentifier } from '@blocksuite/global/di';
import type { IBound, IPoint } from '@blocksuite/global/gfx';
import { Signal } from '@preact/signals-core';
import type { PointerEventState } from '../../event/index.js';
import type { GfxController } from '../controller.js';
import { GfxExtension } from '../extension.js';
import { type BaseTool, type ToolOptions, type ToolOptionWithType, type ToolType } from './tool.js';
type BuiltInHookEvent<T> = {
    data: T;
    preventDefault(): void;
};
type BuiltInEventMap = {
    beforeToolUpdate: BuiltInHookEvent<{
        toolName: string;
    }>;
    toolUpdate: BuiltInHookEvent<{
        toolName: string;
    }>;
};
export type SupportedHooks = keyof BuiltInEventMap;
declare const supportedEvents: readonly ["dragStart", "dragEnd", "dragMove", "pointerMove", "contextMenu", "pointerDown", "pointerUp", "click", "doubleClick", "tripleClick", "pointerOut"];
export type SupportedEvents = (typeof supportedEvents)[number];
export declare enum MouseButton {
    FIFTH = 4,
    FOURTH = 3,
    MAIN = 0,
    MIDDLE = 1,
    SECONDARY = 2
}
export interface ToolEventTarget {
    /**
     * Add a hook before the event is handled by the tool.
     * Return false to prevent the tool from handling the event.
     * @param evtName
     * @param handler
     */
    addHook<K extends SupportedHooks | SupportedEvents>(evtName: K, handler: (evtState: K extends SupportedHooks ? BuiltInEventMap[K] : PointerEventState) => void | boolean): void;
}
export declare class ToolController extends GfxExtension {
    static key: string;
    private readonly _builtInHookSlot;
    private readonly _disposableGroup;
    private readonly _toolOption$;
    private readonly _tools;
    readonly currentToolName$: Signal<string>;
    readonly dragging$: Signal<boolean>;
    /**
     * The dragging area in browser coordinates space.
     *
     * This is similar to `draggingViewArea$`, but if the viewport is changed during dragging,
     * it will be reflected in this area.
     */
    readonly draggingViewportArea$: import("@preact/signals-core").ReadonlySignal<{
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        x: number;
        y: number;
        w: number;
        h: number;
    }>;
    /**
     * The dragging area in browser coordinates space.
     */
    readonly draggingViewArea$: Signal<IBound & {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    }>;
    /**
     * The last mouse move position in browser coordinates space.
     */
    readonly lastMouseViewPos$: Signal<IPoint>;
    /**
     * The last mouse position in model coordinates space.
     */
    readonly lastMousePos$: import("@preact/signals-core").ReadonlySignal<{
        x: number;
        y: number;
    }>;
    get currentTool$(): {
        readonly value: BaseTool<Record<string, unknown>> | undefined;
        peek(): BaseTool<Record<string, unknown>> | undefined;
    };
    get currentToolOption$(): {
        peek(): ToolOptionWithType;
        readonly value: ToolOptionWithType;
    };
    /**
     * The area that is being dragged.
     * The coordinates are in model space.
     */
    readonly draggingArea$: Signal<IBound & {
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    }>;
    static extendGfx(gfx: GfxController): void;
    private _createBuiltInHookCtx;
    private _initializeEvents;
    private _register;
    get: <T extends BaseTool>(type: ToolType<T>) => T;
    mounted(): void;
    setTool: <T extends BaseTool>(toolType: ToolType<T>, options?: ToolOptions<T>) => void;
    unmounted(): void;
}
export declare const ToolControllerIdentifier: ServiceIdentifier<ToolController>;
declare module '../controller.js' {
    interface GfxController {
        readonly tool: ToolController;
    }
}
export {};
//# sourceMappingURL=tool-controller.d.ts.map