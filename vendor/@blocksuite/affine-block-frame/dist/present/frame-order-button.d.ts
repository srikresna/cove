import type { FrameBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { LitElement } from 'lit';
declare const EdgelessFrameOrderButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessFrameOrderButton extends EdgelessFrameOrderButton_base {
    static styles: import("lit").CSSResult;
    private _edgelessFrameOrderPopper;
    disconnectedCallback(): void;
    firstUpdated(): void;
    protected render(): import("lit-html").TemplateResult<1>;
    private accessor _edgelessFrameOrderButton;
    private accessor _edgelessFrameOrderMenu;
    accessor edgeless: BlockComponent;
    accessor frames: FrameBlockModel[];
    accessor popperShow: boolean;
    accessor setPopperShow: (show: boolean) => void;
}
export {};
//# sourceMappingURL=frame-order-button.d.ts.map