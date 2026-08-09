import { LitElement } from 'lit';
import { ConnectorTool } from '../connector-tool';
declare const EdgelessConnectorToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").QuickToolMixinClass>;
export declare class EdgelessConnectorToolButton extends EdgelessConnectorToolButton_base {
    static styles: import("lit").CSSResult;
    private readonly _mode$;
    type: typeof ConnectorTool;
    private _toggleMenu;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=connector-tool-button.d.ts.map