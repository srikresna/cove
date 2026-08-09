import { type ServiceIdentifier } from '@blocksuite/global/di';
import { Bound } from '@blocksuite/global/gfx';
import type { PointerEventState } from '../../event/state/pointer.js';
import type { GfxBlockComponent } from '../../view/index.js';
import { GfxExtension } from '../extension.js';
import { GfxBlockElementModel } from '../model/gfx-block-model.js';
import type { GfxModel } from '../model/model.js';
import { GfxPrimitiveElementModel } from '../model/surface/element-model.js';
import type { GfxElementModelView } from '../view/view.js';
import { type SupportedEvents } from './event.js';
import { type OptionResize, type ResizeHandle, type RotateOption } from './resize/manager.js';
import type { RequestElementsCloneContext } from './types/clone.js';
import type { DragInitializationOption } from './types/drag.js';
import type { BoxSelectionContext, RotateConstraint } from './types/view.js';
type ExtensionPointerHandler = Exclude<SupportedEvents, 'pointerleave' | 'pointerenter'>;
export declare const InteractivityIdentifier: ServiceIdentifier<InteractivityManager>;
export declare class InteractivityManager extends GfxExtension {
    static key: string;
    private readonly _disposable;
    private canvasEventHandler;
    mounted(): void;
    activeInteraction$: import("@preact/signals-core").Signal<{
        type: "move" | "resize" | "rotate";
        elements: GfxModel[];
    } | null>;
    unmounted(): void;
    get interactExtensions(): Map<string, import("./index.js").InteractivityExtension>;
    get keyboard(): import("../keyboard.js").KeyboardController;
    private _safeExecute;
    /**
     * Dispatch event to extensions and gfx view.
     * @param eventName
     * @param evt
     * @returns
     */
    dispatchEvent(eventName: ExtensionPointerHandler, evt: PointerEventState): {
        preventDefaultState: boolean;
        handledByView: boolean;
    } | undefined;
    private _getSelectionConfig;
    private _getSuggestedTarget;
    /**
     * Handle element selection.
     * @param evt The pointer event that triggered the selection.
     * @returns True if the element was selected, false otherwise.
     */
    handleElementSelection(evt: PointerEventState): boolean;
    handleBoxSelection(context: {
        box: BoxSelectionContext['box'];
    }): GfxModel[];
    /**
     * Initialize elements movements.
     * It will handle drag start, move and end events automatically.
     * Note: Call this when mouse is already down.
     */
    handleElementMove(options: DragInitializationOption): void;
    handleElementRotate(options: Omit<RotateOption, 'onRotateStart' | 'onRotateEnd' | 'onRotateUpdate'> & {
        onRotateUpdate?: (payload: {
            currentAngle: number;
            delta: number;
        }) => void;
        onRotateStart?: () => void;
        onRotateEnd?: () => void;
    }): void;
    private _getViewRotateConfig;
    private _getViewResizeConfig;
    getRotateConfig(options: {
        elements: GfxModel[];
    }): {
        initialRotate: number;
        rotatable: boolean;
        viewConfigMap: Map<string, {
            model: GfxModel;
            view: GfxElementModelView | GfxBlockComponent;
            handlers: Required<{
                beforeRotate?: (context: import("./types/view.js").BeforeRotateContext) => void;
                onRotateStart?(context: import("./index.js").RotateStartContext & {
                    default: (context: import("./index.js").RotateStartContext) => void;
                    model: GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | GfxBlockElementModel<import("../index.js").GfxCompatibleProps> | import("../index.js").GfxLocalElementModel;
                    view: GfxBlockComponent<GfxBlockElementModel<import("../index.js").GfxCompatibleProps>, import("../../index.js").BlockService, string> | GfxElementModelView<GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | import("../index.js").GfxLocalElementModel, object>;
                }): void;
                onRotateMove?(context: import("./index.js").RotateStartContext & {
                    newBound: Bound;
                    originalBound: Bound;
                    newRotate: number;
                    originalRotate: number;
                    matrix: DOMMatrix;
                } & {
                    default: (context: import("./index.js").RotateMoveContext) => void;
                    model: GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | GfxBlockElementModel<import("../index.js").GfxCompatibleProps> | import("../index.js").GfxLocalElementModel;
                    view: GfxBlockComponent<GfxBlockElementModel<import("../index.js").GfxCompatibleProps>, import("../../index.js").BlockService, string> | GfxElementModelView<GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | import("../index.js").GfxLocalElementModel, object>;
                }): void;
                onRotateEnd?(context: import("./index.js").RotateStartContext & {
                    default: (context: import("./index.js").RotateStartContext) => void;
                    model: GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | GfxBlockElementModel<import("../index.js").GfxCompatibleProps> | import("../index.js").GfxLocalElementModel;
                    view: GfxBlockComponent<GfxBlockElementModel<import("../index.js").GfxCompatibleProps>, import("../../index.js").BlockService, string> | GfxElementModelView<GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | import("../index.js").GfxLocalElementModel, object>;
                }): void;
            }>;
            defaultHandlers: Required<{
                beforeRotate?: (context: import("./types/view.js").BeforeRotateContext) => void;
                onRotateStart?(context: import("./index.js").RotateStartContext & {
                    default: (context: import("./index.js").RotateStartContext) => void;
                    model: GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | GfxBlockElementModel<import("../index.js").GfxCompatibleProps> | import("../index.js").GfxLocalElementModel;
                    view: GfxBlockComponent<GfxBlockElementModel<import("../index.js").GfxCompatibleProps>, import("../../index.js").BlockService, string> | GfxElementModelView<GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | import("../index.js").GfxLocalElementModel, object>;
                }): void;
                onRotateMove?(context: import("./index.js").RotateStartContext & {
                    newBound: Bound;
                    originalBound: Bound;
                    newRotate: number;
                    originalRotate: number;
                    matrix: DOMMatrix;
                } & {
                    default: (context: import("./index.js").RotateMoveContext) => void;
                    model: GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | GfxBlockElementModel<import("../index.js").GfxCompatibleProps> | import("../index.js").GfxLocalElementModel;
                    view: GfxBlockComponent<GfxBlockElementModel<import("../index.js").GfxCompatibleProps>, import("../../index.js").BlockService, string> | GfxElementModelView<GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | import("../index.js").GfxLocalElementModel, object>;
                }): void;
                onRotateEnd?(context: import("./index.js").RotateStartContext & {
                    default: (context: import("./index.js").RotateStartContext) => void;
                    model: GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | GfxBlockElementModel<import("../index.js").GfxCompatibleProps> | import("../index.js").GfxLocalElementModel;
                    view: GfxBlockComponent<GfxBlockElementModel<import("../index.js").GfxCompatibleProps>, import("../../index.js").BlockService, string> | GfxElementModelView<GfxPrimitiveElementModel<import("../index.js").BaseElementProps> | import("../index.js").GfxLocalElementModel, object>;
                }): void;
            }>;
            constraint: Required<RotateConstraint>;
        }>;
    };
    getResizeHandlers(options: {
        elements: GfxModel[];
    }): ResizeHandle[];
    handleElementResize(options: Omit<OptionResize, 'lockRatio' | 'onResizeStart' | 'onResizeEnd' | 'onResizeUpdate' | 'onResizeMove'> & {
        onResizeStart?: () => void;
        onResizeEnd?: () => void;
        onResizeUpdate?: (payload: {
            lockRatio: boolean;
            scaleX: number;
            scaleY: number;
            exceed: {
                w: boolean;
                h: boolean;
            };
        }) => void;
    }): void;
    requestElementClone(options: RequestElementsCloneContext): Promise<{
        elements: GfxModel[];
    } | undefined>;
}
export {};
//# sourceMappingURL=manager.d.ts.map