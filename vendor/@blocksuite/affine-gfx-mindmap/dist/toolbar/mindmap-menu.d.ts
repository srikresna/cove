import { EmptyTool } from '@blocksuite/affine-gfx-pointer';
import type { MindmapStyle } from '@blocksuite/affine-model';
import { EdgelessDraggableElementController } from '@blocksuite/affine-widget-edgeless-toolbar';
import type { Bound } from '@blocksuite/global/gfx';
import type { BlockStdScope } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import { LitElement, type TemplateResult } from 'lit';
import { type ToolbarMindmapItem } from './assets.js';
import { mediaRender, textRender } from './basket-elements.js';
type TextItem = {
    type: 'text';
    icon: TemplateResult;
    render: typeof textRender;
};
type MediaItem = {
    type: 'media';
    icon: TemplateResult;
    render: typeof mediaRender;
};
type ImportItem = {
    type: 'import';
    icon: TemplateResult;
};
declare const EdgelessMindmapMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessMindmapMenu extends EdgelessMindmapMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _style$;
    draggableController: EdgelessDraggableElementController<ToolbarMindmapItem | TextItem | ImportItem | MediaItem>;
    type: typeof EmptyTool;
    get mindMaps(): ToolbarMindmapItem[];
    private _importMindMapEntry;
    private _onImportMindMap;
    initDragController(): void;
    render(): TemplateResult<1>;
    updated(changedProperties: Map<PropertyKey, unknown>): void;
    accessor model: BlockModel;
    accessor onActiveStyleChange: (style: MindmapStyle) => void;
    accessor onImportMindMap: (bound: Bound) => Promise<void>;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=mindmap-menu.d.ts.map