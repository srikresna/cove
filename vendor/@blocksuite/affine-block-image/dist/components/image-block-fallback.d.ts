import type { ResolvedStateInfo } from '@blocksuite/affine-components/resource';
import { ShadowlessElement } from '@blocksuite/std';
export declare const SURFACE_IMAGE_CARD_WIDTH = 220;
export declare const SURFACE_IMAGE_CARD_HEIGHT = 122;
export declare const NOTE_IMAGE_CARD_WIDTH = 752;
export declare const NOTE_IMAGE_CARD_HEIGHT = 78;
declare const ImageBlockFallbackCard_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class ImageBlockFallbackCard extends ImageBlockFallbackCard_base {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    accessor state: ResolvedStateInfo;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-image-fallback-card': ImageBlockFallbackCard;
    }
}
export {};
//# sourceMappingURL=image-block-fallback.d.ts.map