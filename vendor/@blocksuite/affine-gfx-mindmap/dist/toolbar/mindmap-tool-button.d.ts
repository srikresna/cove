import { EmptyTool } from '@blocksuite/affine-gfx-pointer';
import { EdgelessDraggableElementController } from '@blocksuite/affine-widget-edgeless-toolbar';
import { LitElement } from 'lit';
import { type DraggableTool } from './basket-elements.js';
declare const EdgelessMindmapToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessMindmapToolButton extends EdgelessMindmapToolButton_base {
    static styles: import("lit").CSSResult;
    private readonly _style$;
    draggableController: EdgelessDraggableElementController<DraggableTool>;
    enableActiveBackground: boolean;
    type: (typeof EmptyTool)[];
    get draggableTools(): DraggableTool[];
    get mindmaps(): import("./assets.js").ToolbarMindmapItem[];
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    private _toggleMenu;
    initDragController(): void;
    render(): import("lit-html").TemplateResult<1>;
    updated(_changedProperties: Map<PropertyKey, unknown>): void;
    accessor enableBlur: boolean;
    accessor mindmapElement: HTMLElement;
    accessor readyToDrop: boolean;
}
export {};
//# sourceMappingURL=mindmap-tool-button.d.ts.map