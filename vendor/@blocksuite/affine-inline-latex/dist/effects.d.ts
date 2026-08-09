import { LatexEditorMenu } from './latex-node/latex-editor-menu';
import { LatexEditorUnit } from './latex-node/latex-editor-unit';
import { AffineLatexNode } from './latex-node/latex-node';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'affine-latex-node': AffineLatexNode;
        'latex-editor-unit': LatexEditorUnit;
        'latex-editor-menu': LatexEditorMenu;
    }
}
//# sourceMappingURL=effects.d.ts.map