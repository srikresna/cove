import { type SurfaceBlockModel, type SurfaceContext } from '@blocksuite/affine-block-surface';
import { type ConnectorElementModel } from '@blocksuite/affine-model';
import { BlockService, type BlockStdScope } from '@blocksuite/std';
import type { GfxController, GfxModel, LayerManager, ReorderingDirection } from '@blocksuite/std/gfx';
import { GfxBlockElementModel } from '@blocksuite/std/gfx';
export declare class EdgelessRootService extends BlockService implements SurfaceContext {
    static readonly flavour: "affine:page";
    private readonly _surface;
    get blocks(): GfxBlockElementModel[];
    /**
     * sorted edgeless elements
     */
    get edgelessElements(): GfxModel[];
    /**
     * sorted canvas elements
     */
    get elements(): import("@blocksuite/affine-block-surface").SurfaceElementModel<import("@blocksuite/std/gfx").BaseElementProps>[];
    get frame(): import("@blocksuite/affine-block-frame").EdgelessFrameManager;
    /**
     * Get all sorted frames by presentation orderer,
     * the legacy frame that uses `index` as presentation order
     * will be put at the beginning of the array.
     */
    get frames(): import("@blocksuite/affine-model").FrameBlockModel[];
    get gfx(): GfxController;
    get host(): import("@blocksuite/std").EditorHost;
    get layer(): LayerManager;
    get locked(): boolean;
    set locked(locked: boolean);
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get surface(): SurfaceBlockModel;
    get viewport(): import("@blocksuite/std/gfx").Viewport;
    get zoom(): number;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    constructor(std: BlockStdScope, flavourProvider: {
        flavour: string;
    });
    private _initReadonlyListener;
    private _initSlotEffects;
    generateIndex(): string;
    getConnectors(element: GfxModel | string): ConnectorElementModel[];
    mounted(): void;
    removeElement(id: string | GfxModel): void;
    reorderElement(element: GfxModel, direction: ReorderingDirection): void;
    setZoomByAction(action: 'fit' | 'out' | 'reset' | 'in'): void;
    setZoomByStep(step: number): void;
    unmounted(): void;
}
//# sourceMappingURL=edgeless-root-service.d.ts.map