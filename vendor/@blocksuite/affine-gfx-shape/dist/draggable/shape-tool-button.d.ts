import { LitElement } from 'lit';
import { ShapeTool } from '../shape-tool.js';
declare const EdgelessShapeToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessShapeToolButton extends EdgelessShapeToolButton_base {
    static styles: import("lit").CSSResult;
    private readonly _handleShapeClick;
    private readonly _handleWrapperClick;
    type: typeof ShapeTool;
    private _toggleMenu;
    private _updateOverlay;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=shape-tool-button.d.ts.map