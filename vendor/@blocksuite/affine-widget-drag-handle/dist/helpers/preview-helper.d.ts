import { BlockStdScope } from '@blocksuite/std';
import type { SliceSnapshot } from '@blocksuite/store';
import { EdgelessDndPreviewElement } from '../components/edgeless-preview/preview.js';
import type { AffineDragHandleWidget } from '../drag-handle.js';
export declare class PreviewHelper {
    readonly widget: AffineDragHandleWidget;
    private readonly _calculateQuery;
    getPreviewStd: (blockIds: string[]) => {
        previewStd: BlockStdScope;
        width: number;
        height: undefined;
    };
    private _extractBlockTypes;
    getPreviewElement: (options: {
        blockIds: string[];
        snapshot: SliceSnapshot;
        mode: "block" | "gfx";
    }) => {
        width: number;
        height: undefined;
        element: import("@blocksuite/std").EditorHost;
        left?: undefined;
        top?: undefined;
    } | {
        left: number;
        top: number;
        element: EdgelessDndPreviewElement;
        width?: undefined;
        height?: undefined;
    };
    renderDragPreview: (options: {
        blockIds: string[];
        snapshot: SliceSnapshot;
        container: HTMLElement;
        mode: "block" | "gfx";
    }) => {
        x: number;
        y: number;
    };
    constructor(widget: AffineDragHandleWidget);
}
//# sourceMappingURL=preview-helper.d.ts.map