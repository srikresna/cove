import { NoteBlockModel } from '@blocksuite/affine-model';
import { type BlockStdScope, ShadowlessElement } from '@blocksuite/std';
declare const EdgelessPageBlockTitle_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessPageBlockTitle extends EdgelessPageBlockTitle_base {
    render(): import("lit-html").TemplateResult<1> | undefined;
    accessor std: BlockStdScope;
    accessor note: NoteBlockModel;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-page-block-title': EdgelessPageBlockTitle;
    }
}
export {};
//# sourceMappingURL=edgeless-page-block-title.d.ts.map