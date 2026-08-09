import { InteractivityExtension } from '@blocksuite/std/gfx';
import { type EdgelessFrameManager, type FrameOverlay } from './frame-manager';
export declare class FrameHighlightManager extends InteractivityExtension {
    static key: string;
    get frameMgr(): EdgelessFrameManager;
    get frameHighlightOverlay(): FrameOverlay;
    mounted(): void;
}
//# sourceMappingURL=frame-highlight-manager.d.ts.map