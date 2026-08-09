import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { ShadowlessElement } from '@blocksuite/std';
import type { DeltaInsert } from '@blocksuite/store';
export declare class AffineCodeUnit extends ShadowlessElement {
    get codeBlock(): import("..").CodeBlockComponent | null;
    get vElement(): import("@blocksuite/std/inline").VElement<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }> | null;
    render(): import("lit-html").TemplateResult<1>;
    accessor delta: DeltaInsert<AffineTextAttributes>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-code-unit': AffineCodeUnit;
    }
}
//# sourceMappingURL=affine-code-unit.d.ts.map