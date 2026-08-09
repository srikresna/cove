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
import { HoverController } from '@blocksuite/affine-components/hover';
import { PeekViewProvider } from '@blocksuite/affine-components/peek';
import { CitationProvider } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { isValidUrl, normalizeUrl } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { BlockSelection, ShadowlessElement, TextSelection, } from '@blocksuite/std';
import { INLINE_ROOT_ATTR, ZERO_WIDTH_FOR_EMBED_NODE, ZERO_WIDTH_FOR_EMPTY_LINE, } from '@blocksuite/std/inline';
import { flip, offset, shift } from '@floating-ui/dom';
import { baseTheme } from '@toeverything/theme';
import { css, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { ref } from 'lit-html/directives/ref.js';
// Virtual padding for the footnote popup overflow detection offsets.
const POPUP_SHIFT_PADDING = 8;
// The offset between the footnote node and the popup.
const POPUP_OFFSET = 4;
let AffineFootnoteNode = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _config_decorators;
    let _config_initializers = [];
    let _config_extraInitializers = [];
    let _delta_decorators;
    let _delta_initializers = [];
    let _delta_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    return class AffineFootnoteNode extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _config_decorators = [property({ attribute: false })];
            _delta_decorators = [property({ type: Object })];
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _config_decorators, { kind: "accessor", name: "config", static: false, private: false, access: { has: obj => "config" in obj, get: obj => obj.config, set: (obj, value) => { obj.config = value; } }, metadata: _metadata }, _config_initializers, _config_extraInitializers);
            __esDecorate(this, null, _delta_decorators, { kind: "accessor", name: "delta", static: false, private: false, access: { has: obj => "delta" in obj, get: obj => obj.delta, set: (obj, value) => { obj.delta = value; } }, metadata: _metadata }, _delta_initializers, _delta_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .footnote-node {
      padding: 0 2px;
      user-select: none;
      cursor: pointer;
    }

    .footnote-node {
      .footnote-content-default {
        display: inline-block;
        background: ${unsafeCSSVarV2('block/footnote/numberBgHover')};
        color: ${unsafeCSSVarV2('button/pureWhiteText')};
        width: 14px;
        height: 14px;
        line-height: 14px;
        font-size: 10px;
        font-weight: 400;
        border-radius: 50%;
        text-align: center;
        text-overflow: ellipsis;
        font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
        transition: background 0.3s ease-in-out;
        transform: translateY(-0.2em);
      }
    }

    .footnote-node.hover-effect {
      .footnote-content-default {
        color: var(--affine-text-primary-color);
        background: ${unsafeCSSVarV2('block/footnote/numberBg')};
      }
    }

    .footnote-node.hover-effect:hover {
      .footnote-content-default {
        color: ${unsafeCSSVarV2('button/pureWhiteText')};
        background: ${unsafeCSSVarV2('block/footnote/numberBgHover')};
      }
    }
  `; }
        get customNodeRenderer() {
            return this.config?.customNodeRenderer;
        }
        get customPopupRenderer() {
            return this.config?.customPopupRenderer;
        }
        get interactive() {
            return this.config?.interactive;
        }
        get hidePopup() {
            return this.config?.hidePopup;
        }
        get disableHoverEffect() {
            return this.config?.disableHoverEffect;
        }
        get onPopupClick() {
            return this.config?.onPopupClick;
        }
        get inlineEditor() {
            const inlineRoot = this.closest(`[${INLINE_ROOT_ATTR}]`);
            return inlineRoot?.inlineEditor;
        }
        get selfInlineRange() {
            const selfInlineRange = this.inlineEditor?.getInlineRangeFromElement(this);
            return selfInlineRange;
        }
        get footnote() {
            return this.delta.attributes?.footnote;
        }
        get readonly() {
            return this.std.store.readonly;
        }
        get citationService() {
            return this.std.get(CitationProvider);
        }
        render() {
            const attributes = this.delta.attributes;
            const footnote = attributes?.footnote;
            if (!footnote) {
                return nothing;
            }
            const node = this.customNodeRenderer
                ? this.customNodeRenderer(footnote, this.std)
                : this._FootNoteDefaultContent(footnote);
            const nodeClasses = classMap({
                'footnote-node': true,
                'hover-effect': !this.disableHoverEffect,
            });
            return html `<span
      ${this.hidePopup ? '' : ref(this._whenHover.setReference)}
      class=${nodeClasses}
      >${node}<v-text .str=${ZERO_WIDTH_FOR_EMBED_NODE}></v-text
    ></span>`;
        }
        #config_accessor_storage;
        get config() { return this.#config_accessor_storage; }
        set config(value) { this.#config_accessor_storage = value; }
        #delta_accessor_storage;
        get delta() { return this.#delta_accessor_storage; }
        set delta(value) { this.#delta_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.onFootnoteClick = () => {
                if (!this.footnote) {
                    return;
                }
                const { type, docId, url } = this.footnote.reference;
                switch (type) {
                    case 'doc':
                        if (docId) {
                            this._handleDocReference(docId);
                        }
                        break;
                    case 'url':
                        if (url) {
                            this._handleUrlReference(url);
                        }
                        break;
                }
            };
            this._handleDocReference = (docId) => {
                this.std
                    .getOptional(PeekViewProvider)
                    ?.peek({
                    docId,
                })
                    .catch(console.error);
            };
            this._handleUrlReference = (url) => {
                const normalizedUrl = normalizeUrl(url);
                if (!normalizedUrl || !isValidUrl(normalizedUrl))
                    return;
                window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
            };
            this._updateFootnoteAttributes = (footnote) => {
                if (!this.footnote || this.readonly) {
                    return;
                }
                if (!this.inlineEditor || !this.selfInlineRange) {
                    return;
                }
                this.inlineEditor.formatText(this.selfInlineRange, {
                    footnote: footnote,
                });
            };
            this._FootNoteDefaultContent = (footnote) => {
                return html `<span
      class="footnote-content-default"
      @click=${this.onFootnoteClick}
      >${footnote.label}</span
    >`;
            };
            this._FootNotePopup = (footnote, abortController) => {
                return this.customPopupRenderer
                    ? this.customPopupRenderer(footnote, this.std, abortController)
                    : html `<footnote-popup
          .footnote=${footnote}
          .std=${this.std}
          .abortController=${abortController}
          .onPopupClick=${this.onPopupClick ?? this.onFootnoteClick}
          .updateFootnoteAttributes=${this._updateFootnoteAttributes}
        ></footnote-popup>`;
            };
            this._whenHover = new HoverController(this, ({ abortController }) => {
                const { footnote } = this;
                if (!footnote)
                    return null;
                if (this.config?.hidePopup ||
                    !this.selfInlineRange ||
                    !this.inlineEditor) {
                    return null;
                }
                const selection = this.std?.selection;
                if (!selection) {
                    return null;
                }
                const textSelection = selection.find(TextSelection);
                if (!!textSelection && !textSelection.isCollapsed()) {
                    return null;
                }
                const blockSelections = selection.filter(BlockSelection);
                if (blockSelections.length) {
                    return null;
                }
                this.citationService.trackEvent('Hover', {
                    control: 'Source Footnote',
                });
                return {
                    template: this._FootNotePopup(footnote, abortController),
                    container: this.std.host,
                    computePosition: {
                        referenceElement: this,
                        placement: 'top',
                        autoUpdate: true,
                        middleware: [
                            shift({ padding: POPUP_SHIFT_PADDING }),
                            flip(),
                            offset(POPUP_OFFSET),
                        ],
                    },
                };
            }, { enterDelay: 300 });
            this.#config_accessor_storage = __runInitializers(this, _config_initializers, undefined);
            this.#delta_accessor_storage = (__runInitializers(this, _config_extraInitializers), __runInitializers(this, _delta_initializers, {
                insert: ZERO_WIDTH_FOR_EMPTY_LINE,
                attributes: {},
            }));
            this.#std_accessor_storage = (__runInitializers(this, _delta_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            __runInitializers(this, _std_extraInitializers);
        }
    };
})();
export { AffineFootnoteNode };
