import { LocalShapeElementModel, type MindmapElementModel, type MindmapNode } from '@blocksuite/affine-model';
import { type BoxSelectionContext, GfxElementModelView } from '@blocksuite/std/gfx';
export declare class MindMapView extends GfxElementModelView<MindmapElementModel> {
    static type: string;
    private readonly _collapseButtons;
    private _hoveredState;
    /**
     *
     * @param node The mindmap node or its id to get the collapse button
     * @returns
     */
    getCollapseButton(node: MindmapNode | string): LocalShapeElementModel | undefined;
    private _initCollapseButtons;
    private _needToUpdateButtonStyle;
    private _setLayoutMethod;
    private _setVisibleOnSelection;
    private _updateButtonVisibility;
    private _updateCollapseButton;
    onBoxSelected(context: BoxSelectionContext): boolean;
    onCreated(): void;
    onDestroyed(): void;
}
export declare const MindMapInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=view.d.ts.map