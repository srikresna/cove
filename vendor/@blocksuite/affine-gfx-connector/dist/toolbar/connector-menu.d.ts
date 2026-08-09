import { LitElement } from 'lit';
import { ConnectorTool } from '../connector-tool';
declare const EdgelessConnectorMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessConnectorMenu extends EdgelessConnectorMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _props$;
    private readonly _theme$;
    type: typeof ConnectorTool;
    render(): import("lit-html").TemplateResult<1>;
    accessor onChange: (props: Record<string, unknown>) => void;
}
export {};
//# sourceMappingURL=connector-menu.d.ts.map