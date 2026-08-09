import { type FrameBlockModel } from '@blocksuite/affine-model';
import { GfxBlockComponent } from '@blocksuite/std';
import { type BoxSelectionContext } from '@blocksuite/std/gfx';
export declare class FrameBlockComponent extends GfxBlockComponent<FrameBlockModel> {
    connectedCallback(): void;
    /**
     * Due to potentially very large frame sizes, CSS scaling can cause iOS Safari to crash.
     * To mitigate this issue, we combine size calculations within the rendering rect.
     */
    getCSSTransform(): string;
    getRenderingRect(): {
        x: number;
        y: number;
        w: number;
        h: number;
        rotate: number;
        zIndex: string;
    };
    onBoxSelected(context: BoxSelectionContext): boolean;
    renderGfxBlock(): import("lit-html").TemplateResult<1>;
    accessor showBorder: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-frame': FrameBlockComponent;
    }
}
export declare const FrameBlockInteraction: import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=frame-block.d.ts.map