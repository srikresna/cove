import { ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
export declare const AFFINE_OUTLINE_NOTICE = "affine-outline-notice";
declare const OutlineNotice_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlineNotice extends OutlineNotice_base {
    private readonly _visible$;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_NOTICE]: OutlineNotice;
    }
}
export {};
//# sourceMappingURL=outline-notice.d.ts.map