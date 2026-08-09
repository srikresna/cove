import { LitElement } from 'lit';
import { TemplateTool } from '../template-tool';
declare const EdgelessTemplateButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessTemplateButton extends EdgelessTemplateButton_base {
    static styles: import("lit").CSSResult;
    private _cleanup;
    private _autoUpdateCleanup;
    private _prevTool;
    enableActiveBackground: boolean;
    type: typeof TemplateTool;
    get cards(): import("lit-html").TemplateResult<2>[];
    connectedCallback(): void;
    private _closePanel;
    private _togglePanel;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _openedPanel;
}
export {};
//# sourceMappingURL=template-tool-button.d.ts.map