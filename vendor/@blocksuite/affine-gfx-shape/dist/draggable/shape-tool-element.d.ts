import { type ShapeName, type ShapeStyle } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { LitElement, type PropertyValues, type TemplateResult } from 'lit';
interface Shape {
    name: ShapeName;
    svg: TemplateResult<1>;
}
declare const EdgelessShapeToolElement_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessShapeToolElement extends EdgelessShapeToolElement_base {
    static styles: import("lit").CSSResult;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    private readonly _addShape;
    private readonly _onDragEnd;
    private readonly _onDragMove;
    private readonly _onDragStart;
    private readonly _onMouseMove;
    private readonly _onMouseUp;
    private readonly _onTouchEnd;
    private readonly _touchMove;
    private readonly _transformMap;
    connectedCallback(): void;
    render(): TemplateResult<1>;
    updated(changedProperties: PropertyValues<this>): void;
    private accessor _backupShapeElement;
    private accessor _dragging;
    private accessor _isOutside;
    private accessor _shapeElement;
    private accessor _startCoord;
    accessor edgeless: BlockComponent;
    accessor getContainerRect: () => DOMRect;
    accessor handleClick: () => void;
    accessor order: number;
    accessor shape: Shape;
    accessor shapeStyle: ShapeStyle;
    accessor shapeType: ShapeName;
}
export {};
//# sourceMappingURL=shape-tool-element.d.ts.map