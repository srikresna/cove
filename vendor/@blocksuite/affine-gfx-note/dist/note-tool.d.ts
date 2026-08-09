import type { NoteChildrenFlavour } from '@blocksuite/affine-shared/types';
import type { PointerEventState } from '@blocksuite/std';
import { BaseTool } from '@blocksuite/std/gfx';
export type NoteToolOption = {
    childFlavour: NoteChildrenFlavour;
    childType: string | null;
    tip: string;
};
export declare class NoteTool extends BaseTool<NoteToolOption> {
    static toolName: string;
    private _draggingNoteOverlay;
    private _noteOverlay;
    private get _surfaceComponent();
    private _clearOverlay;
    private _disposeOverlay;
    private _hideOverlay;
    private _resize;
    private _updateOverlayPosition;
    activate(): void;
    click(e: PointerEventState): void;
    deactivate(): void;
    dragEnd(): void;
    dragMove(e: PointerEventState): void;
    dragStart(): void;
    mounted(): void;
    pointerMove(e: PointerEventState): void;
    pointerOut(e: PointerEventState): void;
}
//# sourceMappingURL=note-tool.d.ts.map