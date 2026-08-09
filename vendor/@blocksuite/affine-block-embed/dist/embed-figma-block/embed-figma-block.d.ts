import type { EmbedFigmaModel, EmbedFigmaStyles } from '@blocksuite/affine-model';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
export declare class EmbedFigmaBlockComponent extends EmbedBlockComponent<EmbedFigmaModel> {
    static styles: import("lit").CSSResult;
    _cardStyle: (typeof EmbedFigmaStyles)[number];
    open: () => void;
    refreshData: () => void;
    private _handleDoubleClick;
    private _selectBlock;
    protected _handleClick(event: MouseEvent): void;
    connectedCallback(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=embed-figma-block.d.ts.map