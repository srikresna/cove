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
import { getAttachmentFileIcon, LoadingIcon, WebIcon16, } from '@blocksuite/affine-components/icons';
import { ImageProxyService } from '@blocksuite/affine-shared/adapters';
import { DocDisplayMetaProvider, LinkPreviewServiceIdentifier, } from '@blocksuite/affine-shared/services';
import { unsafeCSSVar, unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { computed, signal } from '@preact/signals-core';
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
let FootNotePopup = (() => {
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _footnote_decorators;
    let _footnote_initializers = [];
    let _footnote_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _abortController_decorators;
    let _abortController_initializers = [];
    let _abortController_extraInitializers = [];
    let _onPopupClick_decorators;
    let _onPopupClick_initializers = [];
    let _onPopupClick_extraInitializers = [];
    let _updateFootnoteAttributes_decorators;
    let _updateFootnoteAttributes_initializers = [];
    let _updateFootnoteAttributes_extraInitializers = [];
    return class FootNotePopup extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _footnote_decorators = [property({ attribute: false })];
            _std_decorators = [property({ attribute: false })];
            _abortController_decorators = [property({ attribute: false })];
            _onPopupClick_decorators = [property({ attribute: false })];
            _updateFootnoteAttributes_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _footnote_decorators, { kind: "accessor", name: "footnote", static: false, private: false, access: { has: obj => "footnote" in obj, get: obj => obj.footnote, set: (obj, value) => { obj.footnote = value; } }, metadata: _metadata }, _footnote_initializers, _footnote_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _abortController_decorators, { kind: "accessor", name: "abortController", static: false, private: false, access: { has: obj => "abortController" in obj, get: obj => obj.abortController, set: (obj, value) => { obj.abortController = value; } }, metadata: _metadata }, _abortController_initializers, _abortController_extraInitializers);
            __esDecorate(this, null, _onPopupClick_decorators, { kind: "accessor", name: "onPopupClick", static: false, private: false, access: { has: obj => "onPopupClick" in obj, get: obj => obj.onPopupClick, set: (obj, value) => { obj.onPopupClick = value; } }, metadata: _metadata }, _onPopupClick_initializers, _onPopupClick_extraInitializers);
            __esDecorate(this, null, _updateFootnoteAttributes_decorators, { kind: "accessor", name: "updateFootnoteAttributes", static: false, private: false, access: { has: obj => "updateFootnoteAttributes" in obj, get: obj => obj.updateFootnoteAttributes, set: (obj, value) => { obj.updateFootnoteAttributes = value; } }, metadata: _metadata }, _updateFootnoteAttributes_initializers, _updateFootnoteAttributes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .footnote-popup-container {
      border-radius: 8px;
      box-shadow: ${unsafeCSSVar('overlayPanelShadow')};
      background-color: ${unsafeCSSVarV2('layer/background/primary')};
      border: 0.5px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
      max-width: 260px;
      padding: 4px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      transition: 0.3s ease-in-out;
      cursor: pointer;
    }

    .footnote-popup-description {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      font-size: var(--affine-font-xs);
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      height: 20px;
    }
  `; }
        connectedCallback() {
            super.connectedCallback();
            this._initLinkPreviewData();
            // If the reference is a url, and the url exists
            // and the link preview data is not already set, fetch the link preview data
            const isTitleAndDescriptionEmpty = !this._linkPreview$.value?.title &&
                !this._linkPreview$.value?.description;
            if (this.footnote.reference.type === 'url' &&
                this.footnote.reference.url &&
                isTitleAndDescriptionEmpty) {
                this._isLoading$.value = true;
                this.std
                    .get(LinkPreviewServiceIdentifier)
                    .query(this.footnote.reference.url)
                    .then(data => {
                    // update the local link preview data
                    this._linkPreview$.value = {
                        favicon: data.icon ?? undefined,
                        title: data.title ?? undefined,
                        description: data.description ?? undefined,
                    };
                    // update the footnote attributes in the node with the link preview data
                    // to avoid fetching the same data multiple times
                    const footnote = {
                        ...this.footnote,
                        reference: {
                            ...this.footnote.reference,
                            ...(data.icon && { favicon: data.icon }),
                            ...(data.title && { title: data.title }),
                            ...(data.description && { description: data.description }),
                        },
                    };
                    this.updateFootnoteAttributes(footnote);
                })
                    .catch(console.error)
                    .finally(() => {
                    this._isLoading$.value = false;
                });
            }
        }
        render() {
            const description = this._linkPreview$.value?.description;
            return html `
      <div class="footnote-popup-container" @click=${this._onClick}>
        <footnote-popup-chip
          .prefixIcon=${this._prefixIcon$.value}
          .label=${this._popupLabel$.value}
          .tooltip=${this._tooltip$.value}
        ></footnote-popup-chip>
        ${description
                ? html ` <div class="footnote-popup-description">${description}</div> `
                : nothing}
      </div>
    `;
        }
        get imageProxyService() {
            return this.std.get(ImageProxyService);
        }
        #footnote_accessor_storage;
        get footnote() { return this.#footnote_accessor_storage; }
        set footnote(value) { this.#footnote_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #abortController_accessor_storage;
        get abortController() { return this.#abortController_accessor_storage; }
        set abortController(value) { this.#abortController_accessor_storage = value; }
        #onPopupClick_accessor_storage;
        get onPopupClick() { return this.#onPopupClick_accessor_storage; }
        set onPopupClick(value) { this.#onPopupClick_accessor_storage = value; }
        #updateFootnoteAttributes_accessor_storage;
        get updateFootnoteAttributes() { return this.#updateFootnoteAttributes_accessor_storage; }
        set updateFootnoteAttributes(value) { this.#updateFootnoteAttributes_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._isLoading$ = signal(false);
            this._linkPreview$ = signal({
                favicon: undefined,
                title: undefined,
                description: undefined,
            });
            this._prefixIcon$ = computed(() => {
                const referenceType = this.footnote.reference.type;
                if (referenceType === 'doc') {
                    const docId = this.footnote.reference.docId;
                    if (!docId) {
                        return undefined;
                    }
                    return this.std.get(DocDisplayMetaProvider).icon(docId).value;
                }
                else if (referenceType === 'attachment') {
                    const fileType = this.footnote.reference.fileType;
                    if (!fileType) {
                        return undefined;
                    }
                    return getAttachmentFileIcon(fileType);
                }
                else if (referenceType === 'url') {
                    if (this._isLoading$.value) {
                        return LoadingIcon();
                    }
                    const favicon = this._linkPreview$.value?.favicon;
                    const imageSrc = favicon
                        ? this.imageProxyService.buildUrl(favicon)
                        : undefined;
                    return imageSrc ? html `<img src=${imageSrc} alt="favicon" />` : WebIcon16;
                }
                return undefined;
            });
            this._popupLabel$ = computed(() => {
                const referenceType = this.footnote.reference.type;
                let label = '';
                const { docId, fileName, url } = this.footnote.reference;
                switch (referenceType) {
                    case 'doc':
                        if (!docId) {
                            return label;
                        }
                        label = this.std.get(DocDisplayMetaProvider).title(docId).value;
                        break;
                    case 'attachment':
                        if (!fileName) {
                            return label;
                        }
                        label = fileName;
                        break;
                    case 'url':
                        if (!url) {
                            return label;
                        }
                        label = this._linkPreview$.value?.title ?? url;
                        break;
                }
                return label;
            });
            this._tooltip$ = computed(() => {
                const referenceType = this.footnote.reference.type;
                if (referenceType === 'url') {
                    const title = this._linkPreview$.value?.title;
                    const url = this.footnote.reference.url;
                    return [title, url].filter(Boolean).join('\n') || '';
                }
                return this._popupLabel$.value;
            });
            this._onClick = () => {
                this.onPopupClick(this.footnote, this.abortController);
                this.abortController.abort();
            };
            this._initLinkPreviewData = () => {
                this._linkPreview$.value = {
                    favicon: this.footnote.reference.favicon,
                    title: this.footnote.reference.title,
                    description: this.footnote.reference.description,
                };
            };
            this.#footnote_accessor_storage = __runInitializers(this, _footnote_initializers, void 0);
            this.#std_accessor_storage = (__runInitializers(this, _footnote_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            this.#abortController_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _abortController_initializers, void 0));
            this.#onPopupClick_accessor_storage = (__runInitializers(this, _abortController_extraInitializers), __runInitializers(this, _onPopupClick_initializers, () => { }));
            this.#updateFootnoteAttributes_accessor_storage = (__runInitializers(this, _onPopupClick_extraInitializers), __runInitializers(this, _updateFootnoteAttributes_initializers, () => { }));
            __runInitializers(this, _updateFootnoteAttributes_extraInitializers);
        }
    };
})();
export { FootNotePopup };
