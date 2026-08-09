import { InteractivityExtension } from '@blocksuite/std/gfx';
export declare class MindMapDragExtension extends InteractivityExtension {
    static key: string;
    /**
     * The response area of the mind map is calculated in real time.
     * It only needs to be calculated once when the mind map is dragged.
     */
    private readonly _responseAreaUpdated;
    private get _indicatorOverlay();
    private _calcDragResponseArea;
    /**
     * Create handlers that can drag and drop mind map nodes
     * @param dragMindMapCtx
     * @param dragState
     * @returns
     */
    private _createManipulationHandlers;
    /**
     * Create handlers that can translate entire mind map
     */
    private _createTranslationHandlers;
    private _drawIndicator;
    private _getHoveredMindMap;
    private _setupDragNodeImage;
    private _updateNodeOpacity;
    mounted(): void;
}
//# sourceMappingURL=mind-map-drag.d.ts.map