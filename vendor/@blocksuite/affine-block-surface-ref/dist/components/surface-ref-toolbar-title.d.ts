import { ShadowlessElement } from '@blocksuite/std';
import type { GfxModel } from '@blocksuite/std/gfx';
import { type TemplateResult } from 'lit';
export declare class SurfaceRefToolbarTitle extends ShadowlessElement {
    static styles: import("lit").CSSResult;
    accessor referenceModel: GfxModel | null;
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'surface-ref-toolbar-title': SurfaceRefToolbarTitle;
    }
}
//# sourceMappingURL=surface-ref-toolbar-title.d.ts.map