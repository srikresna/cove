import type { BlockCaptionEditor } from '@blocksuite/affine-components/caption';
import { ResourceController } from '@blocksuite/affine-components/resource';
import { type ImageBlockModel } from '@blocksuite/affine-model';
import { GfxBlockComponent } from '@blocksuite/std';
export declare class ImageEdgelessBlockComponent extends GfxBlockComponent<ImageBlockModel> {
    private static readonly LOD_MIN_IMAGE_BYTES;
    private static readonly LOD_MIN_IMAGE_PIXELS;
    private static readonly LOD_MAX_ZOOM;
    private static readonly LOD_THUMBNAIL_MAX_EDGE;
    static styles: import("lit").CSSResult;
    resourceController: ResourceController;
    private _lodThumbnailUrl;
    private _lodSourceUrl;
    private _lodGeneratingSourceUrl;
    private _lodGenerationToken;
    private _lastShouldUseLod;
    get blobUrl(): string | null;
    convertToCardView: () => void;
    copy: () => void;
    download: () => void;
    refreshData: () => void;
    private _handleError;
    private _isLargeImage;
    private _shouldUseLod;
    private _revokeLodThumbnail;
    private _resetLodSource;
    private _createImageElement;
    private _createThumbnailBlob;
    private _ensureLodThumbnail;
    private _updateLodFromViewport;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderGfxBlock(): import("lit-html").TemplateResult<1>;
    accessor captionEditor: BlockCaptionEditor | null;
    accessor resizableImg: HTMLDivElement;
}
export declare const ImageEdgelessBlockInteraction: import("@blocksuite/store").ExtensionType;
declare global {
    interface HTMLElementTagNameMap {
        'affine-edgeless-image': ImageEdgelessBlockComponent;
    }
}
//# sourceMappingURL=image-edgeless-block.d.ts.map