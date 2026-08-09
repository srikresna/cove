import { CaptionedBlockComponent, SelectedStyle } from '@blocksuite/affine-components/caption';
import type { EmbedCardStyle, EmbedProps } from '@blocksuite/affine-model';
import type { BlockService } from '@blocksuite/std';
import { type ResizeConstraint } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import { type ReadonlySignal } from '@preact/signals-core';
import type { TemplateResult } from 'lit';
import { type ClassInfo } from 'lit/directives/class-map.js';
import { type StyleInfo } from 'lit/directives/style-map.js';
export declare class EmbedBlockComponent<Model extends BlockModel<EmbedProps> = BlockModel<EmbedProps>, Service extends BlockService = BlockService, WidgetName extends string = string> extends CaptionedBlockComponent<Model, Service, WidgetName> {
    selectedStyle$: ReadonlySignal<ClassInfo> | null;
    readonly isDraggingOnHost$: import("@preact/signals-core").Signal<boolean>;
    readonly isResizing$: import("@preact/signals-core").Signal<boolean>;
    readonly showOverlay$: ReadonlySignal<boolean>;
    private _fetchAbortController;
    _cardStyle: EmbedCardStyle;
    blockDraggable: boolean;
    /**
     * The style of the embed card.
     * You can use this to change the height and width of the card.
     * By default, the height and width are set to `_cardHeight` and `_cardWidth` respectively.
     */
    protected embedContainerStyle: StyleInfo;
    get isCommentHighlighted(): boolean;
    renderEmbed: (content: () => TemplateResult) => TemplateResult<1>;
    /**
     * The height of the current embed card. Changes based on the card style.
     */
    get _cardHeight(): number;
    /**
     * The width of the current embed card. Changes based on the card style.
     */
    get _cardWidth(): number;
    get fetchAbortController(): AbortController;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected accessor blockContainerStyles: StyleInfo | undefined;
    protected accessor embedBlock: HTMLDivElement;
    accessor selectedStyle: SelectedStyle;
    accessor useCaptionEditor: boolean;
    accessor useZeroWidth: boolean;
}
export declare const createEmbedEdgelessBlockInteraction: (flavour: string, config?: {
    resizeConstraint?: ResizeConstraint;
}) => import("@blocksuite/store").ExtensionType;
//# sourceMappingURL=embed-block-element.d.ts.map