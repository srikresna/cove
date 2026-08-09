import { ShadowlessElement } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import { nothing } from 'lit';
export declare const AFFINE_OUTLINE_BLOCK_PREVIEW = "affine-outline-block-preview";
declare const OutlineBlockPreview_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlineBlockPreview extends OutlineBlockPreview_base {
    private get _docDisplayMetaService();
    private _TextBlockPreview;
    render(): import("lit-html").TemplateResult<1>;
    renderBlockByFlavour(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor block: BlockModel;
    accessor disabledIcon: boolean;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_BLOCK_PREVIEW]: OutlineBlockPreview;
    }
}
export {};
//# sourceMappingURL=outline-preview.d.ts.map