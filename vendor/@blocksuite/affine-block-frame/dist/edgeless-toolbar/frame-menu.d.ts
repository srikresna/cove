import { LitElement } from 'lit';
import { FrameTool } from '../frame-tool';
declare const EdgelessFrameMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/affine-widget-edgeless-toolbar").EdgelessToolbarToolClass>;
export declare class EdgelessFrameMenu extends EdgelessFrameMenu_base {
    static styles: import("lit").CSSResult;
    type: typeof FrameTool;
    get frameManager(): import("../frame-manager.js").EdgelessFrameManager;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=frame-menu.d.ts.map