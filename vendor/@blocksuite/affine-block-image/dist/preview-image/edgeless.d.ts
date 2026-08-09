import { ImagePlaceholderBlockComponent } from './page.js';
declare const ImageEdgelessPlaceholderBlockComponent_base: typeof ImagePlaceholderBlockComponent & (new (...args: any[]) => import("@blocksuite/std").GfxBlockComponent);
export declare class ImageEdgelessPlaceholderBlockComponent extends ImageEdgelessPlaceholderBlockComponent_base {
    static styles: import("lit").CSSResult;
    renderGfxBlock(): unknown;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-placeholder-preview-image': ImageEdgelessPlaceholderBlockComponent;
    }
}
export {};
//# sourceMappingURL=edgeless.d.ts.map