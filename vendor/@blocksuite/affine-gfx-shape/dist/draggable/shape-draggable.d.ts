import { EdgelessDraggableElementController } from '@blocksuite/affine-widget-edgeless-toolbar';
import { LitElement } from 'lit';
import { ShapeTool } from '../shape-tool.js';
import type { DraggableShape } from './utils.js';
declare const EdgelessToolbarShapeDraggable_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessToolbarShapeDraggable extends EdgelessToolbarShapeDraggable_base {
    static styles: import("lit").CSSResult;
    draggableController: EdgelessDraggableElementController<DraggableShape>;
    draggingShape: DraggableShape['name'];
    type: typeof ShapeTool;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    get shapeShadow(): "0 0 7px rgba(0, 0, 0, .22)" | "0 0 5px rgba(0, 0, 0, .2)";
    private _setShapeOverlayLock;
    initDragController(): void;
    render(): import("lit-html").TemplateResult<1>;
    updated(_changedProperties: Map<PropertyKey, unknown>): void;
    accessor onShapeClick: (shape: DraggableShape) => void;
    accessor readyToDrop: boolean;
    accessor shapeContainer: HTMLDivElement;
}
export {};
//# sourceMappingURL=shape-draggable.d.ts.map