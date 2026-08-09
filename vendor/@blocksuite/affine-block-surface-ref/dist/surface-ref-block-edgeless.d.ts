import { type SurfaceRefBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
export declare class EdgelessSurfaceRefBlockComponent extends BlockComponent<SurfaceRefBlockModel> {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    private _initSelection;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    accessor _referenceModel: GfxModel | null;
    accessor _focused: boolean;
    renderBlock(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-surface-ref': EdgelessSurfaceRefBlockComponent;
    }
}
//# sourceMappingURL=surface-ref-block-edgeless.d.ts.map