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
import { DocDisplayMetaProvider } from '@blocksuite/affine-shared/services';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { noop } from '@blocksuite/global/utils';
import { LinkedPageIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { consume } from '@lit/context';
import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { placeholderMap, previewIconMap, tocContext, } from '../config.js';
import { isHeadingBlock, isRootBlock } from '../utils/query.js';
import * as styles from './outline-preview.css';
function assertType(value) {
    noop(value);
}
export const AFFINE_OUTLINE_BLOCK_PREVIEW = 'affine-outline-block-preview';
let OutlineBlockPreview = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _block_decorators;
    let _block_initializers = [];
    let _block_extraInitializers = [];
    let _disabledIcon_decorators;
    let _disabledIcon_initializers = [];
    let _disabledIcon_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class OutlineBlockPreview extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _block_decorators = [property({ attribute: false })];
            _disabledIcon_decorators = [property({ attribute: false })];
            __context_decorators = [consume({ context: tocContext })];
            __esDecorate(this, null, _block_decorators, { kind: "accessor", name: "block", static: false, private: false, access: { has: obj => "block" in obj, get: obj => obj.block, set: (obj, value) => { obj.block = value; } }, metadata: _metadata }, _block_initializers, _block_extraInitializers);
            __esDecorate(this, null, _disabledIcon_decorators, { kind: "accessor", name: "disabledIcon", static: false, private: false, access: { has: obj => "disabledIcon" in obj, get: obj => obj.disabledIcon, set: (obj, value) => { obj.disabledIcon = value; } }, metadata: _metadata }, _disabledIcon_initializers, _disabledIcon_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get _docDisplayMetaService() {
            return this._context.editor$.value.std.get(DocDisplayMetaProvider);
        }
        _TextBlockPreview(block) {
            const deltas = block.props.text.yText.toDelta();
            if (!block.props.text.length)
                return nothing;
            const iconClass = this.disabledIcon ? styles.iconDisabled : styles.icon;
            const previewText = deltas.map(delta => {
                if (delta.attributes?.reference) {
                    // If linked doc, render linked doc icon and the doc title.
                    const refAttribute = delta.attributes.reference;
                    const refMeta = block.store.workspace.meta.docMetas.find(doc => doc.id === refAttribute.pageId);
                    const unavailable = !refMeta;
                    const icon = unavailable
                        ? LinkedPageIcon({ width: '1.1em', height: '1.1em' })
                        : this._docDisplayMetaService.icon(refMeta.id).value;
                    const title = unavailable
                        ? 'Deleted doc'
                        : this._docDisplayMetaService.title(refMeta.id).value;
                    return html `<span
          class=${classMap({
                        [styles.linkedDocPreviewUnavailable]: unavailable,
                        [styles.linkedDocPreviewAvailable]: !unavailable,
                    })}
        >
          ${icon}
          <span
            class=${classMap({
                        [styles.linkedDocText]: true,
                        [styles.linkedDocTextUnavailable]: unavailable,
                    })}
            >${title.length ? title : 'Untitled'}</span
          ></span
        >`;
                }
                else {
                    // If not linked doc, render the text.
                    return delta.insert.toString().trim().length > 0
                        ? html `<span class=${styles.textSpan}
              >${delta.insert.toString()}</span
            >`
                        : nothing;
                }
            });
            const headingClass = block.props.type in styles.subtypeStyles
                ? styles.subtypeStyles[block.props.type]
                : '';
            return html `<span
        data-testid="outline-block-preview-${block.props.type}"
        class="${styles.text} ${styles.textGeneral} ${headingClass}"
        >${previewText}</span
      >
      ${this._context.showIcons$.value
                ? html `<span class=${iconClass}
            >${previewIconMap[block.props.type]}</span
          >`
                : nothing}`;
        }
        render() {
            return html `<div class=${styles.outlineBlockPreview}>
      ${this.renderBlockByFlavour()}
    </div>`;
        }
        renderBlockByFlavour() {
            const { block } = this;
            const iconClass = this.disabledIcon ? styles.iconDisabled : styles.icon;
            if (!this._context.enableSorting$.value &&
                !isHeadingBlock(block) &&
                !isRootBlock(block))
                return nothing;
            const showPreviewIcon = this._context.showIcons$.value;
            switch (block.flavour) {
                case 'affine:page':
                    assertType(block);
                    return block.props.title.length > 0
                        ? html `<span
              data-testid="outline-block-preview-title"
              class="${styles.text} ${styles.subtypeStyles.title}"
            >
              ${block.props.title$.value}
            </span>`
                        : nothing;
                case 'affine:paragraph':
                    assertType(block);
                    return this._TextBlockPreview(block);
                case 'affine:list':
                    assertType(block);
                    return this._TextBlockPreview(block);
                case 'affine:bookmark':
                    assertType(block);
                    return html `
          <span class="${styles.text} ${styles.textGeneral}"
            >${block.props.title ||
                        block.props.url ||
                        placeholderMap['bookmark']}</span
          >
          ${showPreviewIcon
                        ? html `<span class=${iconClass}
                >${previewIconMap['bookmark']}</span
              >`
                        : nothing}
        `;
                case 'affine:code':
                    assertType(block);
                    return html `
          <span class="${styles.text} ${styles.textGeneral}"
            >${block.props.language ?? placeholderMap['code']}</span
          >
          ${showPreviewIcon
                        ? html `<span class=${iconClass}>${previewIconMap['code']}</span>`
                        : nothing}
        `;
                case 'affine:database':
                    assertType(block);
                    return html `
          <span class="${styles.text} ${styles.textGeneral}"
            >${block.props.title.toString().length
                        ? block.props.title.toString()
                        : placeholderMap['database']}</span
          >
          ${showPreviewIcon
                        ? html `<span class=${iconClass}>${previewIconMap['table']}</span>`
                        : nothing}
        `;
                case 'affine:image':
                    assertType(block);
                    return html `
          <span class="${styles.text} ${styles.textGeneral}"
            >${block.props.caption?.length
                        ? block.props.caption
                        : placeholderMap['image']}</span
          >
          ${showPreviewIcon
                        ? html `<span class=${iconClass}>${previewIconMap['image']}</span>`
                        : nothing}
        `;
                case 'affine:attachment':
                    assertType(block);
                    return html `
          <span class="${styles.text} ${styles.textGeneral}"
            >${block.props.name?.length
                        ? block.props.name
                        : placeholderMap['attachment']}</span
          >
          ${showPreviewIcon
                        ? html `<span class=${iconClass}
                >${previewIconMap['attachment']}</span
              >`
                        : nothing}
        `;
                default:
                    return nothing;
            }
        }
        #block_accessor_storage = __runInitializers(this, _block_initializers, void 0);
        get block() { return this.#block_accessor_storage; }
        set block(value) { this.#block_accessor_storage = value; }
        #disabledIcon_accessor_storage = (__runInitializers(this, _block_extraInitializers), __runInitializers(this, _disabledIcon_initializers, false));
        get disabledIcon() { return this.#disabledIcon_accessor_storage; }
        set disabledIcon(value) { this.#disabledIcon_accessor_storage = value; }
        #_context_accessor_storage = (__runInitializers(this, _disabledIcon_extraInitializers), __runInitializers(this, __context_initializers, void 0));
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { OutlineBlockPreview };
