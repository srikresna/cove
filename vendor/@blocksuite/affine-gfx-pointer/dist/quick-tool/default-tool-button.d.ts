import { DefaultTool } from '@blocksuite/affine-block-surface';
import { LitElement } from 'lit';
import { PanTool } from '../tools';
declare const EdgelessDefaultToolButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").QuickToolMixinClass>;
export declare class EdgelessDefaultToolButton extends EdgelessDefaultToolButton_base {
    static styles: import("lit").CSSResult;
    type: (typeof PanTool | typeof DefaultTool)[];
    private _changeTool;
    private _fadeIn;
    private _fadeOut;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor currentIcon: HTMLInputElement;
}
export {};
//# sourceMappingURL=default-tool-button.d.ts.map