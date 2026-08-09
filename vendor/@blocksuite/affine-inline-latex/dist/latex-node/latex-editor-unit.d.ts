import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { ShadowlessElement } from '@blocksuite/std';
import type { DeltaInsert } from '@blocksuite/store';
export declare class LatexEditorUnit extends ShadowlessElement {
    get latexMenu(): import("./latex-editor-menu").LatexEditorMenu | null;
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
//# sourceMappingURL=latex-editor-unit.d.ts.map