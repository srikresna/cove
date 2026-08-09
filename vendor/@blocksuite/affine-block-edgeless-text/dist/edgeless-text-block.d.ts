import { type EdgelessTextBlockModel } from '@blocksuite/affine-model';
import { GfxBlockComponent } from '@blocksuite/std';
export declare class EdgelessTextBlockComponent extends GfxBlockComponent<EdgelessTextBlockModel> {
    static styles: import("lit").CSSResult;
    private readonly _resizeObserver;
    private _updateH;
    private _updateW;
    private readonly _style$;
    checkWidthOverflow(width: number): boolean;
    connectedCallback(): void;
    firstUpdated(props: Map<string, unknown>): void;
    getCSSTransform(): string;
    getRenderingRect(): {
        x: number;
        y: number;
        w: number | undefined;
        h: number;
        rotate: number;
        zIndex: string;
    };
    renderGfxBlock(): import("lit-html").TemplateResult<1>;
    renderPageContent(): import("lit-html").TemplateResult<1>;
    tryFocusEnd(): void;
    private accessor _editing;
    private accessor _textContainer;
    accessor childrenContainer: HTMLDivElement;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-text': EdgelessTextBlockComponent;
    }
}
export declare const EdgelessTextInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=edgeless-text-block.d.ts.map