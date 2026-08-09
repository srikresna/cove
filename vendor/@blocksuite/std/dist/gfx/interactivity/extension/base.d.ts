import { type Container } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';
import type { GfxController } from '../../controller.js';
import type { GfxModel } from '../../model/model.js';
import type { GfxInteractivityContext, SupportedEvents } from '../event.js';
import type { ExtensionElementsCloneContext } from '../types/clone.js';
import type { DragExtensionInitializeContext, ExtensionDragEndContext, ExtensionDragMoveContext, ExtensionDragStartContext } from '../types/drag.js';
import type { ExtensionElementResizeContext, ExtensionElementResizeEndContext, ExtensionElementResizeMoveContext, ExtensionElementResizeStartContext } from '../types/resize.js';
import type { ExtensionElementSelectContext } from '../types/select.js';
export declare const InteractivityExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<InteractivityExtension> & (<U extends InteractivityExtension = InteractivityExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class InteractivityExtension extends Extension {
    protected readonly gfx: GfxController;
    static key: string;
    get std(): import("../../../index.js").BlockStdScope;
    event: Omit<InteractivityEventAPI, 'emit'>;
    action: Omit<InteractivityActionAPI, 'emit'>;
    constructor(gfx: GfxController);
    mounted(): void;
    /**
     * Override this method should call `super.unmounted()`
     */
    unmounted(): void;
    static setup(di: Container): void;
}
export declare class InteractivityEventAPI {
    private readonly _handlersMap;
    on(eventName: SupportedEvents, handler: (evt: GfxInteractivityContext) => void): () => void;
    emit(eventName: SupportedEvents, evt: GfxInteractivityContext): void;
    destroy(): void;
}
export type ActionContextMap = {
    dragInitialize: {
        context: DragExtensionInitializeContext;
        returnType: {
            onDragStart?: (context: ExtensionDragStartContext) => void;
            onDragMove?: (context: ExtensionDragMoveContext) => void;
            onDragEnd?: (context: ExtensionDragEndContext) => void;
            clear?: () => void;
        };
    };
    elementsClone: {
        context: ExtensionElementsCloneContext;
        returnType: Promise<{
            elements: GfxModel[];
        } | undefined>;
    };
    elementResize: {
        context: ExtensionElementResizeContext;
        returnType: {
            onResizeStart?: (context: ExtensionElementResizeStartContext) => void;
            onResizeMove?: (context: ExtensionElementResizeMoveContext) => void;
            onResizeEnd?: (context: ExtensionElementResizeEndContext) => void;
        };
    };
    elementSelect: {
        context: ExtensionElementSelectContext;
        returnType: void;
    };
};
export declare class InteractivityActionAPI {
    private readonly _handlers;
    onDragInitialize(handler: (ctx: ActionContextMap['dragInitialize']['context']) => ActionContextMap['dragInitialize']['returnType']): () => void;
    onElementResize(handler: (ctx: ActionContextMap['elementResize']['context']) => ActionContextMap['elementResize']['returnType']): () => boolean;
    onRequestElementsClone(handler: (ctx: ActionContextMap['elementsClone']['context']) => ActionContextMap['elementsClone']['returnType']): () => boolean;
    onElementSelect(handler: (ctx: ActionContextMap['elementSelect']['context']) => ActionContextMap['elementSelect']['returnType']): () => boolean;
    emit<K extends keyof ActionContextMap>(event: K, context: ActionContextMap[K]['context']): ActionContextMap[K]['returnType'] | undefined;
    destroy(): void;
}
//# sourceMappingURL=base.d.ts.map