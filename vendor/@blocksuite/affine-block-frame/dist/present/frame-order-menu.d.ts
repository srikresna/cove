import type { BlockComponent } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EdgelessFrameOrderMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessFrameOrderMenu extends EdgelessFrameOrderMenu_base {
    static styles: import("lit").CSSResult;
    get crud(): import("@blocksuite/affine-block-surface").EdgelessCRUDExtension;
    private get _frameMgr();
    private get _frames();
    private _bindEvent;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _clone;
    private accessor _container;
    private accessor _curIndex;
    private accessor _indicatorLine;
    accessor edgeless: BlockComponent;
    accessor embed: boolean;
}
export {};
//# sourceMappingURL=frame-order-menu.d.ts.map