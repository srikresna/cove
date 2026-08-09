import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { ResourceController } from '@blocksuite/affine-components/resource';
import type { ImageBlockModel } from '@blocksuite/affine-model';
export declare class ImageBlockComponent extends CaptionedBlockComponent<ImageBlockModel> {
    resizeable$: import("@preact/signals-core").ReadonlySignal<boolean>;
    resourceController: ResourceController;
    get blobUrl(): string | null;
    convertToCardView: () => void;
    copy: () => void;
    download: () => void;
    refreshData: () => void;
    get resizableImg(): HTMLElement | undefined;
    get isCommentHighlighted(): boolean;
    private _handleClick;
    private _initHover;
    connectedCallback(): void;
    firstUpdated(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor blockContainerStyles: {
        margin: string;
    };
    private accessor pageImage;
    accessor hoverableContainer: HTMLDivElement;
    accessor useCaptionEditor: boolean;
    accessor useZeroWidth: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-image': ImageBlockComponent;
    }
}
//# sourceMappingURL=image-block.d.ts.map