import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import type { LatexBlockModel } from '@blocksuite/affine-model';
import type { Placement } from '@floating-ui/dom';
export declare class LatexBlockComponent extends CaptionedBlockComponent<LatexBlockModel> {
    static styles: import("lit").CSSResult;
    private _editorAbortController;
    get editorPlacement(): Placement;
    get isBlockSelected(): boolean;
    firstUpdated(props: Map<string, unknown>): void;
    private _handleClick;
    removeEditor(portal: HTMLDivElement): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    selectBlock(): void;
    toggleEditor(): void;
    private accessor _katexContainer;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-latex': LatexBlockComponent;
    }
}
//# sourceMappingURL=latex-block.d.ts.map