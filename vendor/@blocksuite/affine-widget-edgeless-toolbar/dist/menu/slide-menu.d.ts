import { LitElement } from 'lit';
import { type EdgelessToolbarSlots } from '../index';
declare const EdgelessSlideMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessSlideMenu extends EdgelessSlideMenu_base {
    static styles: import("lit").CSSResult;
    private _handleSlideButtonClick;
    private _handleWheel;
    private _toggleSlideButton;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _menuContainer;
    private accessor _slideMenuContent;
    accessor height: string;
    accessor showNext: boolean;
    accessor showPrevious: boolean;
    accessor toolbarSlots: EdgelessToolbarSlots;
}
export {};
//# sourceMappingURL=slide-menu.d.ts.map