import type { EmbedHtmlModel, EmbedHtmlStyles } from '@blocksuite/affine-model';
import { type StyleInfo } from 'lit/directives/style-map.js';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
export declare class EmbedHtmlBlockComponent extends EmbedBlockComponent<EmbedHtmlModel> {
    static styles: import("lit").CSSResult;
    _cardStyle: (typeof EmbedHtmlStyles)[number];
    close: () => void;
    protected embedHtmlStyle: StyleInfo;
    open: () => void;
    refreshData: () => void;
    private _handleDoubleClick;
    private _selectBlock;
    protected _handleClick(event: MouseEvent): void;
    connectedCallback(): void;
    renderBlock(): unknown;
    accessor iframeWrapper: HTMLDivElement;
}
//# sourceMappingURL=embed-html-block.d.ts.map