import type { ResizeHandle } from '@blocksuite/std/gfx';
export declare enum HandleDirection {
    Bottom = "bottom",
    BottomLeft = "bottom-left",
    BottomRight = "bottom-right",
    Left = "left",
    Right = "right",
    Top = "top",
    TopLeft = "top-left",
    TopRight = "top-right"
}
/**
 * Indicate how selected elements can be resized.
 *
 * - edge: The selected elements can only be resized dragging edge, usually when note element is selected
 * - all: The selected elements can be resize both dragging edge or corner, usually when all elements are `shape`
 * - none: The selected elements can't be resized, usually when all elements are `connector`
 * - corner: The selected elements can only be resize dragging corner, this is by default mode
 * - edgeAndCorner: The selected elements can be resize both dragging left right edge or corner, usually when all elements are 'text'
 */
export type ResizeMode = 'edge' | 'all' | 'none' | 'corner' | 'edgeAndCorner';
export declare function RenderResizeHandles(resizeHandles: ResizeHandle[], rotatable: boolean, onPointerDown: (e: PointerEvent, direction: ResizeHandle) => void, getCursor?: (options: {
    type: 'resize' | 'rotate';
    handle: ResizeHandle;
}) => string): import("lit-html").TemplateResult<1>;
//# sourceMappingURL=resize-handles.d.ts.map