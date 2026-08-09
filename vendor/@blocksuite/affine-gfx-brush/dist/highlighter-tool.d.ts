import type { PointerEventState } from '@blocksuite/std';
import { BaseTool } from '@blocksuite/std/gfx';
export declare class HighlighterTool extends BaseTool {
    static HIGHLIGHTER_POP_GAP: number;
    static toolName: string;
    private _draggingElement;
    private _draggingElementId;
    private _lastPoint;
    private _lastPopLength;
    private readonly _pressureSupportedPointerIds;
    private _straightLineType;
    protected _draggingPathPoints: number[][] | null;
    protected _draggingPathPressures: number[] | null;
    private _getStraightLineType;
    private _tryGetPressurePoints;
    dragEnd(): void;
    dragMove(e: PointerEventState): void;
    dragStart(e: PointerEventState): void;
    activate(): void;
}
//# sourceMappingURL=highlighter-tool.d.ts.map