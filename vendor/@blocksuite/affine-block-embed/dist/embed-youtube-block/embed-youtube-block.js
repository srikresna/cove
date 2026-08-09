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
import { LoadingIcon, OpenIcon } from '@blocksuite/affine-components/icons';
import { ImageProxyService } from '@blocksuite/affine-shared/adapters';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { BlockSelection } from '@blocksuite/std';
import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
import { getEmbedCardIcons } from '../common/utils.js';
import { youtubeUrlRegex } from './embed-youtube-model.js';
import { styles, YoutubeIcon } from './styles.js';
import { refreshEmbedYoutubeUrlData } from './utils.js';
let EmbedYoutubeBlockComponent = (() => {
    let _classSuper = EmbedBlockComponent;
    let __showImage_decorators;
    let __showImage_initializers = [];
    let __showImage_extraInitializers = [];
    let _loading_decorators;
    let _loading_initializers = [];
    let _loading_extraInitializers = [];
    return class EmbedYoutubeBlockComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __showImage_decorators = [state()];
            _loading_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __showImage_decorators, { kind: "accessor", name: "_showImage", static: false, private: false, access: { has: obj => "_showImage" in obj, get: obj => obj._showImage, set: (obj, value) => { obj._showImage = value; } }, metadata: _metadata }, __showImage_initializers, __showImage_extraInitializers);
            __esDecorate(this, null, _loading_decorators, { kind: "accessor", name: "loading", static: false, private: false, access: { has: obj => "loading" in obj, get: obj => obj.loading, set: (obj, value) => { obj.loading = value; } }, metadata: _metadata }, _loading_initializers, _loading_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        _handleDoubleClick(event) {
            event.stopPropagation();
            this.open();
        }
        _selectBlock() {
            const selectionManager = this.host.selection;
            const blockSelection = selectionManager.create(BlockSelection, {
                blockId: this.blockId,
            });
            selectionManager.setGroup('note', [blockSelection]);
        }
        _handleClick(event) {
            event.stopPropagation();
            this._selectBlock();
        }
        connectedCallback() {
            super.connectedCallback();
            this._cardStyle = this.model.props.style;
            if (!this.model.props.videoId) {
                this.store.withoutTransact(() => {
                    const url = this.model.props.url;
                    const urlMatch = url.match(youtubeUrlRegex);
                    if (urlMatch) {
                        const [, videoId] = urlMatch;
                        this.store.updateBlock(this.model, {
                            videoId,
                        });
                    }
                });
            }
            if (!this.model.props.description && !this.model.props.title) {
                this.store.withoutTransact(() => {
                    this.refreshData();
                });
            }
            this.disposables.add(this.model.propsUpdated.subscribe(({ key }) => {
                this.requestUpdate();
                if (key === 'url') {
                    this.refreshData();
                }
            }));
            matchMedia('print').addEventListener('change', () => {
                this._showImage = matchMedia('print').matches;
            });
        }
        renderBlock() {
            const { image, title, description, creator, creatorImage, videoId } = this.model.props;
            const loading = this.loading;
            const theme = this.std.get(ThemeProvider).theme;
            const imageProxyService = this.store.get(ImageProxyService);
            const { EmbedCardBannerIcon } = getEmbedCardIcons(theme);
            const titleIcon = loading ? LoadingIcon() : YoutubeIcon;
            const titleText = loading ? 'Loading...' : title || 'YouTube';
            const descriptionText = loading ? null : description;
            const bannerImage = !loading && image
                ? html `<img src=${imageProxyService.buildUrl(image)} alt="banner" />`
                : EmbedCardBannerIcon;
            const creatorImageEl = !loading && creatorImage
                ? html `<img
            src=${imageProxyService.buildUrl(creatorImage)}
            alt="creator"
          />`
                : nothing;
            return this.renderEmbed(() => html `
        <div
          class=${classMap({
                'affine-embed-youtube-block': true,
                loading,
                selected: this.selected$.value,
            })}
          style=${styleMap({
                transformOrigin: '0 0',
            })}
          @click=${this._handleClick}
          @dblclick=${this._handleDoubleClick}
        >
          <div class="affine-embed-youtube-video">
            ${videoId
                ? html `
                  <div class="affine-embed-youtube-video-iframe-container">
                    <iframe
                      id="ytplayer"
                      type="text/html"
                      src=${`https://www.youtube.com/embed/${videoId}`}
                      frameborder="0"
                      allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      loading="lazy"
                      credentialless
                    ></iframe>

                    <!-- overlay to prevent the iframe from capturing pointer events -->
                    <div
                      class=${classMap({
                    'affine-embed-youtube-video-iframe-overlay': true,
                    hide: !this.showOverlay$.value,
                })}
                    ></div>
                    <img
                      class=${classMap({
                    'affine-embed-youtube-video-iframe-overlay': true,
                    'media-print': true,
                    hide: !this._showImage,
                })}
                      src=${`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                      alt="YouTube Video"
                      loading="lazy"
                    />
                  </div>
                `
                : bannerImage}
          </div>
          <div class="affine-embed-youtube-content">
            <div class="affine-embed-youtube-content-header">
              <div class="affine-embed-youtube-content-title-icon">
                ${titleIcon}
              </div>

              <div class="affine-embed-youtube-content-title-text">
                ${titleText}
              </div>

              <div class="affine-embed-youtube-content-creator-image">
                ${creatorImageEl}
              </div>

              <div class="affine-embed-youtube-content-creator-text">
                ${creator}
              </div>
            </div>

            ${loading
                ? html `<div
                  class="affine-embed-youtube-content-description"
                ></div>`
                : descriptionText
                    ? html `<div class="affine-embed-youtube-content-description">
                    ${descriptionText}
                  </div>`
                    : nothing}

            <div class="affine-embed-youtube-content-url" @click=${this.open}>
              <span>www.youtube.com</span>

              <div class="affine-embed-youtube-content-url-icon">
                ${OpenIcon}
              </div>
            </div>
          </div>
        </div>
      `);
        }
        #_showImage_accessor_storage;
        get _showImage() { return this.#_showImage_accessor_storage; }
        set _showImage(value) { this.#_showImage_accessor_storage = value; }
        #loading_accessor_storage;
        get loading() { return this.#loading_accessor_storage; }
        set loading(value) { this.#loading_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._cardStyle = 'video';
            this.open = () => {
                let link = this.model.props.url;
                if (!link.match(/^[a-zA-Z]+:\/\//)) {
                    link = 'https://' + link;
                }
                window.open(link, '_blank');
            };
            this.refreshData = () => {
                refreshEmbedYoutubeUrlData(this, this.fetchAbortController.signal).catch(console.error);
            };
            this.#_showImage_accessor_storage = __runInitializers(this, __showImage_initializers, false);
            this.#loading_accessor_storage = (__runInitializers(this, __showImage_extraInitializers), __runInitializers(this, _loading_initializers, false));
            __runInitializers(this, _loading_extraInitializers);
        }
    };
})();
export { EmbedYoutubeBlockComponent };
