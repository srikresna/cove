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
import { getEmbedCardIcons } from '@blocksuite/affine-block-embed';
import { LoadingIcon, WebIcon16 } from '@blocksuite/affine-components/icons';
import { ImageProxyService } from '@blocksuite/affine-shared/adapters';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { getHostName } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { OpenInNewIcon } from '@blocksuite/icons/lit';
import { isGfxBlockComponent, ShadowlessElement } from '@blocksuite/std';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from '../styles.js';
let BookmarkCard = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _bookmark_decorators;
    let _bookmark_initializers = [];
    let _bookmark_extraInitializers = [];
    let _error_decorators;
    let _error_initializers = [];
    let _error_extraInitializers = [];
    let _loading_decorators;
    let _loading_initializers = [];
    let _loading_extraInitializers = [];
    return class BookmarkCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _bookmark_decorators = [property({ attribute: false })];
            _error_decorators = [property({ attribute: false })];
            _loading_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _bookmark_decorators, { kind: "accessor", name: "bookmark", static: false, private: false, access: { has: obj => "bookmark" in obj, get: obj => obj.bookmark, set: (obj, value) => { obj.bookmark = value; } }, metadata: _metadata }, _bookmark_initializers, _bookmark_extraInitializers);
            __esDecorate(this, null, _error_decorators, { kind: "accessor", name: "error", static: false, private: false, access: { has: obj => "error" in obj, get: obj => obj.error, set: (obj, value) => { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            __esDecorate(this, null, _loading_decorators, { kind: "accessor", name: "loading", static: false, private: false, access: { has: obj => "loading" in obj, get: obj => obj.loading, set: (obj, value) => { obj.loading = value; } }, metadata: _metadata }, _loading_initializers, _loading_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.add(this.bookmark.model.propsUpdated.subscribe(() => {
                this.requestUpdate();
            }));
            this.disposables.add(this.bookmark.std
                .get(ThemeProvider)
                .theme$.subscribe(() => this.requestUpdate()));
        }
        render() {
            const { url, style } = this.bookmark.model.props;
            const { icon, title, description, image } = this.bookmark.linkPreview$.value;
            const cardClassMap = classMap({
                loading: this.loading,
                error: this.error,
                [style]: true,
                selected: this.bookmark.selected$.value,
                edgeless: isGfxBlockComponent(this.bookmark),
                'comment-highlighted': this.bookmark.isCommentHighlighted,
            });
            const domainName = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im)?.[1];
            const titleText = this.loading
                ? 'Loading...'
                : !title
                    ? this.error
                        ? (domainName ?? 'Link card')
                        : ''
                    : title;
            const theme = this.bookmark.std.get(ThemeProvider).theme;
            const { EmbedCardBannerIcon } = getEmbedCardIcons(theme);
            const imageProxyService = this.bookmark.store.get(ImageProxyService);
            const titleIcon = this.loading
                ? LoadingIcon()
                : icon
                    ? html `<img src=${imageProxyService.buildUrl(icon)} alt="icon" />`
                    : WebIcon16;
            const descriptionText = this.loading
                ? ''
                : !description
                    ? this.error
                        ? 'Failed to retrieve link information.'
                        : url
                    : (description ?? '');
            const bannerImage = !this.loading && image
                ? html `<img src=${imageProxyService.buildUrl(image)} alt="banner" />`
                : EmbedCardBannerIcon;
            return html `
      <div
        class="affine-bookmark-card ${cardClassMap}"
        @click=${this.bookmark.handleClick}
        @dblclick=${this.bookmark.handleDoubleClick}
      >
        <div class="affine-bookmark-content">
          <div class="affine-bookmark-content-title">
            <div class="affine-bookmark-content-title-icon">${titleIcon}</div>
            <div class="affine-bookmark-content-title-text">${titleText}</div>
          </div>
          <div class="affine-bookmark-content-description">
            ${descriptionText}
          </div>
          <div class="affine-bookmark-content-url-wrapper">
            <div
              class="affine-bookmark-content-url"
              @click=${this.bookmark.open}
            >
              <span>${getHostName(url)}</span>
              <div class="affine-bookmark-content-url-icon">
                ${OpenInNewIcon({ width: '12', height: '12' })}
              </div>
            </div>
          </div>
        </div>
        <div class="affine-bookmark-banner">${bannerImage}</div>
      </div>
    `;
        }
        #bookmark_accessor_storage = __runInitializers(this, _bookmark_initializers, void 0);
        get bookmark() { return this.#bookmark_accessor_storage; }
        set bookmark(value) { this.#bookmark_accessor_storage = value; }
        #error_accessor_storage = (__runInitializers(this, _bookmark_extraInitializers), __runInitializers(this, _error_initializers, void 0));
        get error() { return this.#error_accessor_storage; }
        set error(value) { this.#error_accessor_storage = value; }
        #loading_accessor_storage = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _loading_initializers, void 0));
        get loading() { return this.#loading_accessor_storage; }
        set loading(value) { this.#loading_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _loading_extraInitializers);
        }
    };
})();
export { BookmarkCard };
