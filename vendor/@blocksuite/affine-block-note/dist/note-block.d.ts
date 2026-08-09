import type { NoteBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
export declare class NoteBlockComponent extends BlockComponent<NoteBlockModel> {
    static styles: import("lit").CSSResult;
    connectedCallback(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-note': NoteBlockComponent;
    }
}
//# sourceMappingURL=note-block.d.ts.map