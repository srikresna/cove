import type { ShapeElementModel } from '@blocksuite/affine-model';
import { type GfxBlockElementModel } from '@blocksuite/std/gfx';
import { PageClipboard } from '../../clipboard/index.js';
interface CanvasExportOptions {
    dpr?: number;
    padding?: number;
    background?: string;
}
export declare class EdgelessClipboardController extends PageClipboard {
    static key: string;
    private readonly _initEdgelessClipboard;
    private readonly _onCopy;
    private readonly _onCut;
    private readonly _onPaste;
    private get _exportManager();
    private get doc();
    private get selectionManager();
    private get surface();
    private get frame();
    private get gfx();
    private get crud();
    private get toolManager();
    private _checkCanContinueToCanvas;
    private _edgelessToCanvas;
    private _emitSelectionChangeAfterPaste;
    private _pasteShapesAndBlocks;
    private _pasteTextContentAsNote;
    copy(): void;
    mounted(): void;
    toCanvas(blocks: GfxBlockElementModel[], shapes: ShapeElementModel[], options?: CanvasExportOptions): Promise<HTMLCanvasElement | undefined>;
}
export {};
//# sourceMappingURL=clipboard.d.ts.map