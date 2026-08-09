import type { DatabaseBlockModel } from '@blocksuite/affine-model';
import { BlockComponent } from '@blocksuite/std';
export declare class DatabaseDndPreviewBlockComponent extends BlockComponent<DatabaseBlockModel> {
    static styles: import("lit").CSSResult;
    renderBlock(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-dnd-preview-database': DatabaseDndPreviewBlockComponent;
    }
}
//# sourceMappingURL=database-dnd-preview-block.d.ts.map