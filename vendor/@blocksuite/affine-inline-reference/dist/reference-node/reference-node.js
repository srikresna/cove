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
import { whenHover } from '@blocksuite/affine-components/hover';
import { Peekable } from '@blocksuite/affine-components/peek';
import { DEFAULT_DOC_NAME, REFERENCE_NODE, } from '@blocksuite/affine-shared/consts';
import { DocDisplayMetaProvider, ToolbarRegistryIdentifier, } from '@blocksuite/affine-shared/services';
import { affineTextStyles } from '@blocksuite/affine-shared/styles';
import { cloneReferenceInfo, referenceToNode, } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { LinkedPageIcon } from '@blocksuite/icons/lit';
import { BLOCK_ID_ATTR, ShadowlessElement } from '@blocksuite/std';
import { INLINE_ROOT_ATTR, ZERO_WIDTH_FOR_EMBED_NODE, ZERO_WIDTH_FOR_EMPTY_LINE, } from '@blocksuite/std/inline';
import { css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { RefNodeSlotsProvider } from './reference-node-slots';
let AffineReference = (() => {
    let _classDecorators = [Peekable({ action: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WithDisposable(ShadowlessElement);
    let _refMeta_decorators;
    let _refMeta_initializers = [];
    let _refMeta_extraInitializers = [];
    let _config_decorators;
    let _config_initializers = [];
    let _config_extraInitializers = [];
    let _delta_decorators;
    let _delta_initializers = [];
    let _delta_extraInitializers = [];
    let _selected_decorators;
    let _selected_initializers = [];
    let _selected_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    var AffineReference = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _refMeta_decorators = [state()];
            _config_decorators = [property({ attribute: false })];
            _delta_decorators = [property({ type: Object })];
            _selected_decorators = [property({ type: Boolean })];
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _refMeta_decorators, { kind: "accessor", name: "refMeta", static: false, private: false, access: { has: obj => "refMeta" in obj, get: obj => obj.refMeta, set: (obj, value) => { obj.refMeta = value; } }, metadata: _metadata }, _refMeta_initializers, _refMeta_extraInitializers);
            __esDecorate(this, null, _config_decorators, { kind: "accessor", name: "config", static: false, private: false, access: { has: obj => "config" in obj, get: obj => obj.config, set: (obj, value) => { obj.config = value; } }, metadata: _metadata }, _config_initializers, _config_extraInitializers);
            __esDecorate(this, null, _delta_decorators, { kind: "accessor", name: "delta", static: false, private: false, access: { has: obj => "delta" in obj, get: obj => obj.delta, set: (obj, value) => { obj.delta = value; } }, metadata: _metadata }, _delta_initializers, _delta_extraInitializers);
            __esDecorate(this, null, _selected_decorators, { kind: "accessor", name: "selected", static: false, private: false, access: { has: obj => "selected" in obj, get: obj => obj.selected, set: (obj, value) => { obj.selected = value; } }, metadata: _metadata }, _selected_initializers, _selected_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AffineReference = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .affine-reference {
      white-space: normal;
      word-break: break-word;
      color: var(--affine-text-primary-color);
      fill: var(--affine-icon-color);
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      padding: 1px 2px 1px 0;
    }
    .affine-reference:hover {
      background: var(--affine-hover-color);
    }

    .affine-reference[data-selected='true'] {
      background: var(--affine-hover-color);
    }

    .affine-reference-title {
      margin-left: 4px;
      border-bottom: 0.5px solid var(--affine-divider-color);
      transition: border 0.2s ease-out;
    }
    .affine-reference-title:hover {
      border-bottom: 0.5px solid var(--affine-icon-color);
    }
  `; }
        get docTitle() {
            return this.refMeta?.title ?? DEFAULT_DOC_NAME;
        }
        #refMeta_accessor_storage;
        // Since the linked doc may be deleted, the `_refMeta` could be undefined.
        get refMeta() { return this.#refMeta_accessor_storage; }
        set refMeta(value) { this.#refMeta_accessor_storage = value; }
        get _icon() {
            const { pageId, params, title } = this.referenceInfo;
            return this.std
                .get(DocDisplayMetaProvider)
                .icon(pageId, { params, title, referenced: true }).value;
        }
        get _title() {
            const { pageId, params, title } = this.referenceInfo;
            return (this.std
                .get(DocDisplayMetaProvider)
                .title(pageId, { params, title, referenced: true }).value || title);
        }
        get block() {
            if (!this.inlineEditor?.rootElement)
                return null;
            const block = this.inlineEditor.rootElement.closest(`[${BLOCK_ID_ATTR}]`);
            return block;
        }
        get customContent() {
            return this.config.customContent;
        }
        get doc() {
            const doc = this.config.doc;
            return doc;
        }
        get inlineEditor() {
            const inlineRoot = this.closest(`[${INLINE_ROOT_ATTR}]`);
            return inlineRoot?.inlineEditor;
        }
        get referenceInfo() {
            const reference = this.delta.attributes?.reference;
            const id = this.doc?.id ?? '';
            if (!reference)
                return { pageId: id };
            return cloneReferenceInfo(reference);
        }
        get selfInlineRange() {
            const selfInlineRange = this.inlineEditor?.getInlineRangeFromElement(this);
            return selfInlineRange;
        }
        connectedCallback() {
            super.connectedCallback();
            this._whenHover.setReference(this);
            const message$ = this.std.get(ToolbarRegistryIdentifier).message$;
            this._disposables.add(() => {
                if (message$?.value) {
                    message$.value = null;
                }
                this._whenHover.dispose();
            });
            if (!this.config) {
                console.error('`reference-node` need `ReferenceNodeConfig`.');
                return;
            }
            if (this.delta.insert !== REFERENCE_NODE) {
                console.error(`Reference node must be initialized with '${REFERENCE_NODE}', but got '${this.delta.insert}'`);
            }
            const doc = this.doc;
            if (doc) {
                this._disposables.add(doc.workspace.slots.docListUpdated.subscribe(() => this._updateRefMeta(doc)));
            }
            this.updateComplete
                .then(() => {
                if (!this.inlineEditor || !doc)
                    return;
                // observe yText update
                this.disposables.add(this.inlineEditor.slots.textChange.subscribe(() => this._updateRefMeta(doc)));
            })
                .catch(console.error);
        }
        // reference to block/element
        referenceToNode() {
            return referenceToNode(this.referenceInfo);
        }
        render() {
            const refMeta = this.refMeta;
            const isDeleted = !refMeta;
            const attributes = this.delta.attributes;
            const reference = attributes?.reference;
            const type = reference?.type;
            if (!attributes || !type) {
                return nothing;
            }
            const title = this._title;
            const icon = choose(type, [
                ['LinkedPage', () => this._icon],
                [
                    'Subpage',
                    () => LinkedPageIcon({
                        width: '1.25em',
                        height: '1.25em',
                        style: 'user-select:none;flex-shrink:0;vertical-align:middle;font-size:inherit;margin-bottom:0.1em;',
                    }),
                ],
            ]);
            const style = affineTextStyles(attributes, isDeleted
                ? {
                    color: 'var(--affine-text-disable-color)',
                    textDecoration: 'line-through',
                    fill: 'var(--affine-text-disable-color)',
                }
                : {});
            const content = this.customContent
                ? this.customContent(this)
                : html `${icon}<span
            data-title=${ifDefined(title)}
            class="affine-reference-title"
            >${title}</span
          >`;
            // we need to add `<v-text .str=${ZERO_WIDTH_FOR_EMBED_NODE}></v-text>` in an
            // embed element to make sure inline range calculation is correct
            return html `<span
      data-selected=${this.selected}
      class="affine-reference"
      style=${styleMap(style)}
      @click=${(event) => this.open({ event })}
      @auxclick=${(event) => this.open({ event })}
      >${content}<v-text .str=${ZERO_WIDTH_FOR_EMBED_NODE}></v-text
    ></span>`;
        }
        willUpdate(_changedProperties) {
            super.willUpdate(_changedProperties);
            const doc = this.doc;
            if (doc) {
                this._updateRefMeta(doc);
            }
        }
        #config_accessor_storage;
        get config() { return this.#config_accessor_storage; }
        set config(value) { this.#config_accessor_storage = value; }
        #delta_accessor_storage;
        get delta() { return this.#delta_accessor_storage; }
        set delta(value) { this.#delta_accessor_storage = value; }
        #selected_accessor_storage;
        get selected() { return this.#selected_accessor_storage; }
        set selected(value) { this.#selected_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._updateRefMeta = (doc) => {
                const refAttribute = this.delta.attributes?.reference;
                if (!refAttribute) {
                    return;
                }
                const refMeta = doc.workspace.meta.docMetas.find(doc => doc.id === refAttribute.pageId);
                this.refMeta = refMeta
                    ? {
                        ...refMeta,
                    }
                    : undefined;
            };
            this.#refMeta_accessor_storage = __runInitializers(this, _refMeta_initializers, undefined);
            this.open = (__runInitializers(this, _refMeta_extraInitializers), (event) => {
                if (!this.config.interactable)
                    return;
                if (event?.event?.button === 2) {
                    return;
                }
                this.std.getOptional(RefNodeSlotsProvider)?.docLinkClicked.next({
                    ...this.referenceInfo,
                    ...event,
                    openMode: event?.event?.button === 1 ? 'open-in-new-tab' : event?.openMode,
                    host: this.std.host,
                });
            });
            this._whenHover = whenHover(hovered => {
                if (!this.config.interactable)
                    return;
                const message$ = this.std.get(ToolbarRegistryIdentifier).message$;
                if (hovered) {
                    message$.value = {
                        flavour: 'affine:reference',
                        element: this,
                        setFloating: this._whenHover.setFloating,
                    };
                    return;
                }
                // Clears previous bindings
                message$.value = null;
                this._whenHover.setFloating();
            }, { enterDelay: 500 });
            this.#config_accessor_storage = __runInitializers(this, _config_initializers, void 0);
            this.#delta_accessor_storage = (__runInitializers(this, _config_extraInitializers), __runInitializers(this, _delta_initializers, {
                insert: ZERO_WIDTH_FOR_EMPTY_LINE,
                attributes: {},
            }));
            this.#selected_accessor_storage = (__runInitializers(this, _delta_extraInitializers), __runInitializers(this, _selected_initializers, false));
            this.#std_accessor_storage = (__runInitializers(this, _selected_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            __runInitializers(this, _std_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return AffineReference = _classThis;
})();
export { AffineReference };
