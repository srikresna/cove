import type { EmbedYoutubeModel, EmbedYoutubeStyles } from '@blocksuite/affine-model';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
import type { EmbedYoutubeBlockService } from './embed-youtube-service.js';
export declare class EmbedYoutubeBlockComponent extends EmbedBlockComponent<EmbedYoutubeModel, EmbedYoutubeBlockService> {
    static styles: import("lit").CSSResult;
    _cardStyle: (typeof EmbedYoutubeStyles)[number];
    open: () => void;
    refreshData: () => void;
    private _handleDoubleClick;
    private _selectBlock;
    protected _handleClick(event: MouseEvent): void;
    connectedCallback(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    private accessor _showImage;
    accessor loading: boolean;
}
//# sourceMappingURL=embed-youtube-block.d.ts.map