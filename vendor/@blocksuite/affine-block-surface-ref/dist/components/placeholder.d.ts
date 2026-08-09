import { ColorScheme } from '@blocksuite/affine-model';
import { ShadowlessElement } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
import { nothing } from 'lit';
declare const SurfaceRefPlaceHolder_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class SurfaceRefPlaceHolder extends SurfaceRefPlaceHolder_base {
    static styles: import("lit").CSSResult;
    accessor referenceModel: GfxModel | null;
    accessor refFlavour: string;
    accessor inEdgeless: boolean;
    accessor theme: ColorScheme;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'surface-ref-placeholder': SurfaceRefPlaceHolder;
    }
}
export {};
//# sourceMappingURL=placeholder.d.ts.map