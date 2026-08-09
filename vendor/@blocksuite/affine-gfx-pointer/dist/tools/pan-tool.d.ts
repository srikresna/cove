import type { PointerEventState } from '@blocksuite/std';
import { BaseTool } from '@blocksuite/std/gfx';
import { Signal } from '@preact/signals-core';
export type PanToolOption = {
    panning: boolean;
};
export declare class PanTool extends BaseTool<PanToolOption> {
    static toolName: string;
    private _lastPoint;
    private _pendingDelta;
    private readonly _deltaFlushCoalescer;
    readonly panning$: Signal<boolean>;
    private _flushPendingDelta;
    get allowDragWithRightButton(): boolean;
    dragEnd(_: PointerEventState): void;
    dragMove(e: PointerEventState): void;
    dragStart(e: PointerEventState): void;
    mounted(): void;
    unmounted(): void;
}
//# sourceMappingURL=pan-tool.d.ts.map