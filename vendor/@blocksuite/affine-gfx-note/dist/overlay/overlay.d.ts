import { ToolOverlay } from '@blocksuite/affine-block-surface';
import { type Color } from '@blocksuite/affine-model';
import type { XYWH } from '@blocksuite/global/gfx';
import type { GfxController } from '@blocksuite/std/gfx';
import { Subject } from 'rxjs';
export declare class NoteOverlay extends ToolOverlay {
    backgroundColor: string;
    text: string;
    constructor(gfx: GfxController, background: Color);
    private _getOverlayText;
    render(ctx: CanvasRenderingContext2D): void;
}
export declare class DraggingNoteOverlay extends NoteOverlay {
    height: number;
    slots: {
        draggingNoteUpdated: Subject<{
            xywh: XYWH;
        }>;
    };
    width: number;
    constructor(gfx: GfxController, background: Color);
    render(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=overlay.d.ts.map