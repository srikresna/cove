import { InteractivityExtension } from '@blocksuite/std/gfx';
import type { SnapOverlay } from './snap-overlay';
export declare class SnapExtension extends InteractivityExtension {
    static key: string;
    private static readonly MAX_ALIGN_SKIP_STRIDE;
    private static readonly ALIGN_HEAVY_COST_MS;
    private static readonly ALIGN_RECOVERY_COST_MS;
    get snapOverlay(): SnapOverlay;
    mounted(): void;
}
//# sourceMappingURL=snap-manager.d.ts.map