import { DisposableGroup } from '@blocksuite/global/disposable';
import type { GfxController } from '@blocksuite/std/gfx';
import type { RoughCanvas } from '../utils/rough/canvas';
import { Overlay } from './overlay';
export declare class ToolOverlay extends Overlay {
    protected disposables: DisposableGroup;
    globalAlpha: number;
    x: number;
    y: number;
    constructor(gfx: GfxController);
    dispose(): void;
    render(ctx: CanvasRenderingContext2D, rc: RoughCanvas): void;
}
//# sourceMappingURL=tool-overlay.d.ts.map