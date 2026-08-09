var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { LoadingIcon } from '@blocksuite/affine-components/icons';
import { Peekable } from '@blocksuite/affine-components/peek';
import { ResourceController } from '@blocksuite/affine-components/resource';
import { ImageBlockSchema, } from '@blocksuite/affine-model';
import { cssVarV2, unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { formatSize } from '@blocksuite/affine-shared/utils';
import { BrokenImageIcon, ImageIcon } from '@blocksuite/icons/lit';
import { GfxBlockComponent } from '@blocksuite/std';
import { GfxViewInteractionExtension } from '@blocksuite/std/gfx';
import { computed } from '@preact/signals-core';
import { css, html } from 'lit';
import { query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import { copyImageBlob, downloadImageBlob, refreshData, turnImageIntoCardView, } from './utils';
let ImageEdgelessBlockComponent = (() => {
    let _classDecorators = [Peekable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = GfxBlockComponent;
    let _captionEditor_decorators;
    let _captionEditor_initializers = [];
    let _captionEditor_extraInitializers = [];
    let _resizableImg_decorators;
    let _resizableImg_initializers = [];
    let _resizableImg_extraInitializers = [];
    var ImageEdgelessBlockComponent = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _captionEditor_decorators = [query('block-caption-editor')];
            _resizableImg_decorators = [query('.resizable-img')];
            __esDecorate(this, null, _captionEditor_decorators, { kind: "accessor", name: "captionEditor", static: false, private: false, access: { has: obj => "captionEditor" in obj, get: obj => obj.captionEditor, set: (obj, value) => { obj.captionEditor = value; } }, metadata: _metadata }, _captionEditor_initializers, _captionEditor_extraInitializers);
            __esDecorate(this, null, _resizableImg_decorators, { kind: "accessor", name: "resizableImg", static: false, private: false, access: { has: obj => "resizableImg" in obj, get: obj => obj.resizableImg, set: (obj, value) => { obj.resizableImg = value; } }, metadata: _metadata }, _resizableImg_initializers, _resizableImg_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ImageEdgelessBlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.LOD_MIN_IMAGE_BYTES = 1024 * 1024; }
        static { this.LOD_MIN_IMAGE_PIXELS = 1920 * 1080; }
        static { this.LOD_MAX_ZOOM = 0.4; }
        static { this.LOD_THUMBNAIL_MAX_EDGE = 256; }
        static { this.styles = css `
    affine-edgeless-image {
      position: relative;
    }

    affine-edgeless-image .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 4px;
      right: 4px;
      width: 36px;
      height: 36px;
      padding: 5px;
      border-radius: 8px;
      background: ${unsafeCSSVarV2('loading/imageLoadingBackground', '#92929238')};

      & > svg {
        font-size: 25.71px;
      }
    }

    affine-edgeless-image .affine-image-status {
      position: absolute;
      left: 18px;
      bottom: 18px;
    }

    affine-edgeless-image .resizable-img,
    affine-edgeless-image .resizable-img img {
      width: 100%;
      height: 100%;
    }

    affine-edgeless-image .resizable-img {
      position: relative;
      overflow: hidden;
    }
  `; }
        get blobUrl() {
            return this.resourceController.blobUrl$.value;
        }
        _handleError() {
            this.resourceController.updateState({
                errorMessage: 'Failed to download image!',
            });
        }
        _isLargeImage() {
            const { width = 0, height = 0, size = 0 } = this.model.props;
            const pixels = width * height;
            return (size >= ImageEdgelessBlockComponent.LOD_MIN_IMAGE_BYTES ||
                pixels >= ImageEdgelessBlockComponent.LOD_MIN_IMAGE_PIXELS);
        }
        _shouldUseLod(blobUrl, zoom = this.gfx.viewport.zoom) {
            return (Boolean(blobUrl) &&
                this._isLargeImage() &&
                zoom <= ImageEdgelessBlockComponent.LOD_MAX_ZOOM);
        }
        _revokeLodThumbnail() {
            if (!this._lodThumbnailUrl) {
                return;
            }
            URL.revokeObjectURL(this._lodThumbnailUrl);
            this._lodThumbnailUrl = null;
        }
        _resetLodSource(blobUrl) {
            if (this._lodSourceUrl === blobUrl) {
                return;
            }
            this._lodGenerationToken += 1;
            this._lodGeneratingSourceUrl = null;
            this._lodSourceUrl = blobUrl;
            this._revokeLodThumbnail();
        }
        _createImageElement(src) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.decoding = 'async';
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error('Failed to load image'));
                image.src = src;
            });
        }
        _createThumbnailBlob(image) {
            const maxEdge = ImageEdgelessBlockComponent.LOD_THUMBNAIL_MAX_EDGE;
            const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
            const scale = longestEdge > maxEdge ? maxEdge / longestEdge : 1;
            const targetWidth = Math.max(1, Math.round(image.naturalWidth * scale));
            const targetHeight = Math.max(1, Math.round(image.naturalHeight * scale));
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return Promise.resolve(null);
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'low';
            ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
            return new Promise(resolve => {
                canvas.toBlob(resolve);
            });
        }
        _ensureLodThumbnail(blobUrl) {
            if (this._lodThumbnailUrl ||
                this._lodGeneratingSourceUrl === blobUrl ||
                !this._shouldUseLod(blobUrl)) {
                return;
            }
            const token = ++this._lodGenerationToken;
            this._lodGeneratingSourceUrl = blobUrl;
            void this._createImageElement(blobUrl)
                .then(image => this._createThumbnailBlob(image))
                .then(blob => {
                if (!blob || token !== this._lodGenerationToken || !this.isConnected) {
                    return;
                }
                const thumbnailUrl = URL.createObjectURL(blob);
                if (token !== this._lodGenerationToken || !this.isConnected) {
                    URL.revokeObjectURL(thumbnailUrl);
                    return;
                }
                this._revokeLodThumbnail();
                this._lodThumbnailUrl = thumbnailUrl;
                if (this._shouldUseLod(this.blobUrl)) {
                    this.requestUpdate();
                }
            })
                .catch(err => {
                if (token !== this._lodGenerationToken || !this.isConnected) {
                    return;
                }
                console.error(err);
            })
                .finally(() => {
                if (token === this._lodGenerationToken) {
                    this._lodGeneratingSourceUrl = null;
                }
            });
        }
        _updateLodFromViewport(zoom) {
            const shouldUseLod = this._shouldUseLod(this.blobUrl, zoom);
            if (shouldUseLod === this._lastShouldUseLod) {
                return;
            }
            this._lastShouldUseLod = shouldUseLod;
            if (shouldUseLod && this.blobUrl) {
                this._ensureLodThumbnail(this.blobUrl);
            }
            this.requestUpdate();
        }
        connectedCallback() {
            super.connectedCallback();
            this.contentEditable = 'false';
            this.resourceController.setEngine(this.std.store.blobSync);
            this.disposables.add(this.resourceController.subscribe());
            this.disposables.add(this.resourceController);
            this.disposables.add(this.model.props.sourceId$.subscribe(() => {
                this._resetLodSource(null);
                this.refreshData();
            }));
            this.disposables.add(this.gfx.viewport.viewportUpdated.subscribe(({ zoom }) => {
                this._updateLodFromViewport(zoom);
            }));
            this._lastShouldUseLod = this._shouldUseLod(this.blobUrl);
        }
        disconnectedCallback() {
            this._lodGenerationToken += 1;
            this._lodGeneratingSourceUrl = null;
            this._lodSourceUrl = null;
            this._revokeLodThumbnail();
            super.disconnectedCallback();
        }
        renderGfxBlock() {
            const blobUrl = this.blobUrl;
            const { rotate, size: rawSize, caption = 'Image' } = this.model.props;
            const size = rawSize ?? 0;
            this._resetLodSource(blobUrl);
            const containerStyleMap = styleMap({
                display: 'flex',
                position: 'relative',
                width: '100%',
                height: '100%',
                transform: `rotate(${rotate}deg)`,
                transformOrigin: 'center',
            });
            const resovledState = this.resourceController.resolveStateWith({
                loadingIcon: LoadingIcon({
                    strokeColor: cssVarV2('button/pureWhiteText'),
                    ringColor: cssVarV2('loading/imageLoadingLayer', '#ffffff8f'),
                }),
                errorIcon: BrokenImageIcon(),
                icon: ImageIcon(),
                title: 'Image',
                description: formatSize(size),
            });
            const { loading, icon, description, error, needUpload } = resovledState;
            const shouldUseLod = this._shouldUseLod(blobUrl);
            if (shouldUseLod && blobUrl) {
                this._ensureLodThumbnail(blobUrl);
            }
            this._lastShouldUseLod = shouldUseLod;
            const imageUrl = shouldUseLod && this._lodThumbnailUrl ? this._lodThumbnailUrl : blobUrl;
            return html `
      <div class="affine-image-container" style=${containerStyleMap}>
        ${when(blobUrl, () => html `
            <div class="resizable-img">
              <img
                class="drag-target"
                draggable="false"
                loading="lazy"
                src=${imageUrl ?? ''}
                alt=${caption}
                @error=${this._handleError}
              />
            </div>
            ${when(loading, () => html `<div class="loading">${icon}</div>`)}
            ${when(Boolean(error && description), () => html `<affine-resource-status
                  class="affine-image-status"
                  .message=${description}
                  .needUpload=${needUpload}
                  .action=${() => needUpload
                ? this.resourceController.upload()
                : this.refreshData()}
                ></affine-resource-status>`)}
          `, () => html `<affine-image-fallback-card
              .state=${resovledState}
            ></affine-image-fallback-card>`)}
        <affine-block-selection .block=${this}></affine-block-selection>
      </div>
      <block-caption-editor></block-caption-editor>

      ${Object.values(this.widgets)}
    `;
        }
        #captionEditor_accessor_storage;
        get captionEditor() { return this.#captionEditor_accessor_storage; }
        set captionEditor(value) { this.#captionEditor_accessor_storage = value; }
        #resizableImg_accessor_storage;
        get resizableImg() { return this.#resizableImg_accessor_storage; }
        set resizableImg(value) { this.#resizableImg_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.resourceController = new ResourceController(computed(() => this.model.props.sourceId$.value), 'Image');
            this._lodThumbnailUrl = null;
            this._lodSourceUrl = null;
            this._lodGeneratingSourceUrl = null;
            this._lodGenerationToken = 0;
            this._lastShouldUseLod = false;
            this.convertToCardView = () => {
                turnImageIntoCardView(this).catch(console.error);
            };
            this.copy = () => {
                copyImageBlob(this).catch(console.error);
            };
            this.download = () => {
                downloadImageBlob(this).catch(console.error);
            };
            this.refreshData = () => {
                refreshData(this).catch(console.error);
            };
            this.#captionEditor_accessor_storage = __runInitializers(this, _captionEditor_initializers, void 0);
            this.#resizableImg_accessor_storage = (__runInitializers(this, _captionEditor_extraInitializers), __runInitializers(this, _resizableImg_initializers, void 0));
            __runInitializers(this, _resizableImg_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return ImageEdgelessBlockComponent = _classThis;
})();
export { ImageEdgelessBlockComponent };
export const ImageEdgelessBlockInteraction = GfxViewInteractionExtension(ImageBlockSchema.model.flavour, {
    resizeConstraint: {
        lockRatio: true,
    },
});
