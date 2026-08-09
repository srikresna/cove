import { GroupElementModel } from '@blocksuite/affine-model';
import { GfxElementModelView } from '@blocksuite/std/gfx';
export declare class GroupElementView extends GfxElementModelView<GroupElementModel> {
    static type: string;
    onCreated(): void;
    private _initDblClickToEdit;
}
export declare const GroupInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=element-view.d.ts.map