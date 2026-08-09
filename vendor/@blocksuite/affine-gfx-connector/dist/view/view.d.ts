import { type ConnectorElementModel } from '@blocksuite/affine-model';
import { type DragEndContext, type DragMoveContext, type DragStartContext, GfxElementModelView } from '@blocksuite/std/gfx';
export declare class ConnectorElementView extends GfxElementModelView<ConnectorElementModel> {
    static type: string;
    onDragStart: (context: DragStartContext) => void;
    onDragEnd: (context: DragEndContext) => void;
    onDragMove: (context: DragMoveContext) => void;
    onCreated(): void;
    private _initLabelMoving;
}
export declare const ConnectorInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=view.d.ts.map