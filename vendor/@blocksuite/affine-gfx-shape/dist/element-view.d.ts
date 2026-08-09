import { ShapeElementModel } from '@blocksuite/affine-model';
import { GfxElementModelView } from '@blocksuite/std/gfx';
export declare class ShapeElementView extends GfxElementModelView<ShapeElementModel> {
    static type: string;
    onCreated(): void;
    private _initDblClickToEdit;
}
export declare const ShapeViewInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=element-view.d.ts.map