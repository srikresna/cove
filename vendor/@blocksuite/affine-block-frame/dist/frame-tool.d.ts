import type { PointerEventState } from '@blocksuite/std';
import { BaseTool } from '@blocksuite/std/gfx';
import { type FrameOverlay } from './frame-manager';
export declare class FrameTool extends BaseTool {
    static toolName: string;
    private _frame;
    private _startPoint;
    get frameManager(): import("./frame-manager").EdgelessFrameManager;
    get frameOverlay(): FrameOverlay;
    private _toModelCoord;
    dragEnd(): void;
    dragMove(e: PointerEventState): void;
    dragStart(e: PointerEventState): void;
}
//# sourceMappingURL=frame-tool.d.ts.map