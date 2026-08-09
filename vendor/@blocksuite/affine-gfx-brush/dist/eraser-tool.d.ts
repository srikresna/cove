import type { PointerEventState } from '@blocksuite/std';
import { BaseTool } from '@blocksuite/std/gfx';
export declare class EraserTool extends BaseTool {
    static toolName: string;
    private _erasable;
    private _eraserPoints;
    private readonly _eraseTargets;
    private get _surfaceComponent();
    private readonly _loop;
    private readonly _overlay;
    private _prevEraserPoint;
    private _prevPoint;
    private _timer;
    private _timestamp;
    private _reset;
    activate(): void;
    dragEnd(_: PointerEventState): void;
    dragMove(e: PointerEventState): void;
    dragStart(e: PointerEventState): void;
}
//# sourceMappingURL=eraser-tool.d.ts.map