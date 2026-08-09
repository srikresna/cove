import type { ImageBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
export declare class ImagePlaceholderBlockComponent extends BlockComponent<ImageBlockModel> {
    static styles: import("lit").CSSResult;
    renderBlock(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-placeholder-preview-image': ImagePlaceholderBlockComponent;
    }
}
//# sourceMappingURL=page.d.ts.map