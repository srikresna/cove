import type { TextElementModel } from '@blocksuite/affine-model';
import { GfxElementModelView } from '@blocksuite/std/gfx';
export declare class TextElementView extends GfxElementModelView<TextElementModel> {
    static type: string;
    onCreated(): void;
    private _initDblClickToEdit;
}
export declare const TextInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=element-view.d.ts.map