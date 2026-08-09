import { LitElement } from 'lit';
import { EraserTool } from '../../../eraser-tool';
declare const EdgelessEraserToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessEraserToolButton extends EdgelessEraserToolButton_base {
    static styles: import("lit").CSSResult;
    enableActiveBackground: boolean;
    type: typeof EraserTool;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=eraser-tool-button.d.ts.map