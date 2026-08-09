import type { EmbedLoomModel, EmbedLoomStyles } from '@blocksuite/affine-model';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
import type { EmbedLoomBlockService } from './embed-loom-service.js';
export declare class EmbedLoomBlockComponent extends EmbedBlockComponent<EmbedLoomModel, EmbedLoomBlockService> {
    static styles: import("lit").CSSResult;
    _cardStyle: (typeof EmbedLoomStyles)[number];
    open: () => void;
    refreshData: () => void;
    private _handleDoubleClick;
    private _selectBlock;
    protected _handleClick(event: MouseEvent): void;
    connectedCallback(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor loading: boolean;
}
//# sourceMappingURL=embed-loom-block.d.ts.map