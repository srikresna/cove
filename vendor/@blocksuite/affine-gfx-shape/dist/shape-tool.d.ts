import type { ShapeName } from '@blocksuite/affine-model';
import type { PointerEventState } from '@blocksuite/std';
import { BaseTool, type GfxController } from '@blocksuite/std/gfx';
export type ShapeToolOption = {
    shapeName: ShapeName;
};
export declare class ShapeTool extends BaseTool<ShapeToolOption> {
    static toolName: string;
    private _disableOverlay;
    private _draggingElement;
    private _draggingElementId;
    private _shapeOverlay;
    private get _surfaceComponent();
    private _spacePressedCtx;
    private _addNewShape;
    private _hideOverlay;
    private _resize;
    private _updateOverlayPosition;
    constructor(gfx: GfxController);
    activate(): void;
    clearOverlay(): void;
    click(e: PointerEventState): void;
    createOverlay(): void;
    deactivate(): void;
    dragEnd(): void;
    dragMove(e: PointerEventState): void;
    dragStart(e: PointerEventState): void;
    mounted(): void;
    pointerMove(e: PointerEventState): void;
    pointerOut(e: PointerEventState): void;
    setDisableOverlay(disable: boolean): void;
    cycleShapeName(dir?: 'prev' | 'next'): ShapeName;
}
//# sourceMappingURL=shape-tool.d.ts.map