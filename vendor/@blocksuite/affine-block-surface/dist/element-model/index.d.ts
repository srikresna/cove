import { BrushElementModel, ConnectorElementModel, GroupElementModel, HighlighterElementModel, MindmapElementModel, ShapeElementModel, TextElementModel } from '@blocksuite/affine-model';
import { SurfaceElementModel } from './base.js';
export declare const elementsCtorMap: {
    group: typeof GroupElementModel;
    connector: typeof ConnectorElementModel;
    shape: typeof ShapeElementModel;
    brush: typeof BrushElementModel;
    text: typeof TextElementModel;
    mindmap: typeof MindmapElementModel;
    highlighter: typeof HighlighterElementModel;
};
export { BrushElementModel, ConnectorElementModel, GroupElementModel, HighlighterElementModel, MindmapElementModel, ShapeElementModel, SurfaceElementModel, TextElementModel, };
export declare enum CanvasElementType {
    BRUSH = "brush",
    CONNECTOR = "connector",
    GROUP = "group",
    MINDMAP = "mindmap",
    SHAPE = "shape",
    TEXT = "text",
    HIGHLIGHTER = "highlighter"
}
export type ElementModelMap = {
    ['shape']: ShapeElementModel;
    ['brush']: BrushElementModel;
    ['connector']: ConnectorElementModel;
    ['text']: TextElementModel;
    ['group']: GroupElementModel;
    ['mindmap']: MindmapElementModel;
    ['highlighter']: HighlighterElementModel;
};
export declare function isCanvasElementType(type: string): type is CanvasElementType;
//# sourceMappingURL=index.d.ts.map