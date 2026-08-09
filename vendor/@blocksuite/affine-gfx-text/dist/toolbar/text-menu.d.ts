import { LitElement, nothing } from 'lit';
import { TextTool } from '../tool';
declare const EdgelessTextMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessTextMenu extends EdgelessTextMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _theme$;
    type: typeof TextTool;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    accessor color: string;
    accessor onChange: (props: Record<string, unknown>) => void;
}
export {};
//# sourceMappingURL=text-menu.d.ts.map