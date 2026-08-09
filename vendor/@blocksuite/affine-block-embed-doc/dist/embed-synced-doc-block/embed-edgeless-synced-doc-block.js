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
import { toEdgelessEmbedBlock } from '@blocksuite/affine-block-embed';
import { EdgelessCRUDIdentifier, reassociateConnectorsCommand, } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/affine-model';
import { EMBED_CARD_HEIGHT, EMBED_CARD_WIDTH, } from '@blocksuite/affine-shared/consts';
import { ThemeExtensionIdentifier, ThemeProvider, } from '@blocksuite/affine-shared/services';
import { Bound } from '@blocksuite/global/gfx';
import { BlockStdScope } from '@blocksuite/std';
import { html, nothing } from 'lit';
import { query } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { guard } from 'lit/directives/guard.js';
import { styleMap } from 'lit/directives/style-map.js';
import { EmbedSyncedDocConfigExtension } from './configs';
import { EmbedSyncedDocBlockComponent } from './embed-synced-doc-block';
let EmbedEdgelessSyncedDocBlockComponent = (() => {
    let _classSuper = toEdgelessEmbedBlock(EmbedSyncedDocBlockComponent);
    let _headerWrapper_decorators;
    let _headerWrapper_initializers = [];
    let _headerWrapper_extraInitializers = [];
    let _contentElement_decorators;
    let _contentElement_initializers = [];
    let _contentElement_extraInitializers = [];
    return class EmbedEdgelessSyncedDocBlockComponent extends _classSuper {
        constructor() {
            super(...arguments);
            this.#headerWrapper_accessor_storage = __runInitializers(this, _headerWrapper_initializers, null);
            this.#contentElement_accessor_storage = (__runInitializers(this, _headerWrapper_extraInitializers), __runInitializers(this, _contentElement_initializers, null));
            this._renderSyncedView = (__runInitializers(this, _contentElement_extraInitializers), () => {
                const { syncedDoc, editorMode } = this;
                if (!syncedDoc) {
                    console.error('Synced doc is not found');
                    return html `${nothing}`;
                }
                let containerStyleMap = styleMap({
                    position: 'relative',
                    width: '100%',
                });
                const modelScale = this.model.props.scale ?? 1;
                const bound = Bound.deserialize(this.model.xywh);
                const width = bound.w / modelScale;
                const height = bound.h / modelScale;
                containerStyleMap = styleMap({
                    width: `${width}px`,
                    height: `${height}px`,
                    minHeight: `${height}px`,
                    transform: `scale(${modelScale})`,
                    transformOrigin: '0 0',
                });
                const themeService = this.std.get(ThemeProvider);
                const themeExtension = this.std.getOptional(ThemeExtensionIdentifier);
                const appTheme = themeService.app$.value;
                let edgelessTheme = themeService.edgeless$.value;
                if (themeExtension?.getEdgelessTheme && this.syncedDoc?.id) {
                    edgelessTheme = themeExtension.getEdgelessTheme(this.syncedDoc.id).value;
                }
                const theme = this.isPageMode ? appTheme : edgelessTheme;
                const scale = this.model.props.scale ?? 1;
                this.dataset.nestedEditor = '';
                const renderEditor = () => {
                    return choose(editorMode, [
                        [
                            'page',
                            () => html `
            <div class="affine-page-viewport" data-theme=${appTheme}>
              ${new BlockStdScope({
                                store: syncedDoc,
                                extensions: this._buildPreviewSpec('preview-page'),
                            }).render()}
            </div>
          `,
                        ],
                        [
                            'edgeless',
                            () => html `
            <div class="affine-edgeless-viewport" data-theme=${edgelessTheme}>
              ${new BlockStdScope({
                                store: syncedDoc,
                                extensions: this._buildPreviewSpec('preview-edgeless'),
                            }).render()}
            </div>
          `,
                        ],
                    ]);
                };
                const header = this.std
                    .getOptional(EmbedSyncedDocConfigExtension.identifier)
                    ?.edgelessHeader({
                    model: this.model,
                    std: this.std,
                }) ?? nothing;
                return this.renderEmbed(() => html `
        <div
          class=${classMap({
                    'affine-embed-synced-doc-container': true,
                    [editorMode]: true,
                    [theme]: true,
                    surface: true,
                    selected: this.selected$.value,
                })}
          @click=${this._handleClick}
          style=${containerStyleMap}
          ?data-scale=${scale}
        >
          <div class="affine-embed-synced-doc-edgeless-header-wrapper">
            ${header}
          </div>
          <div class="affine-embed-synced-doc-editor">
            ${this.isPageMode && this._isEmptySyncedDoc
                    ? html `
                  <div class="affine-embed-synced-doc-editor-empty">
                    <span>
                      This is a linked doc, you can add content here.
                    </span>
                  </div>
                `
                    : guard([editorMode, syncedDoc], renderEditor)}
          </div>
          <div class="affine-embed-synced-doc-editor-overlay"></div>
        </div>
      `);
            });
            this.convertToCard = (aliasInfo) => {
                const { id, store, xywh } = this.model;
                const { caption } = this.model.props;
                const style = 'vertical';
                const bound = Bound.deserialize(xywh);
                bound.w = EMBED_CARD_WIDTH[style];
                bound.h = EMBED_CARD_HEIGHT[style];
                const { addBlock } = this.std.get(EdgelessCRUDIdentifier);
                const surface = this.gfx.surface ?? undefined;
                const newId = addBlock('affine:embed-linked-doc', {
                    xywh: bound.serialize(),
                    style,
                    caption,
                    ...this.referenceInfo,
                    ...aliasInfo,
                }, surface);
                this.std.command.exec(reassociateConnectorsCommand, {
                    oldId: id,
                    newId,
                });
                this.gfx.selection.set({
                    editing: false,
                    elements: [newId],
                });
                store.deleteBlock(this.model);
            };
            this.#useCaptionEditor_accessor_storage = true;
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _headerWrapper_decorators = [query('.affine-embed-synced-doc-edgeless-header-wrapper')];
            _contentElement_decorators = [query('affine-preview-root')];
            __esDecorate(this, null, _headerWrapper_decorators, { kind: "accessor", name: "headerWrapper", static: false, private: false, access: { has: obj => "headerWrapper" in obj, get: obj => obj.headerWrapper, set: (obj, value) => { obj.headerWrapper = value; } }, metadata: _metadata }, _headerWrapper_initializers, _headerWrapper_extraInitializers);
            __esDecorate(this, null, _contentElement_decorators, { kind: "accessor", name: "contentElement", static: false, private: false, access: { has: obj => "contentElement" in obj, get: obj => obj.contentElement, set: (obj, value) => { obj.contentElement = value; } }, metadata: _metadata }, _contentElement_initializers, _contentElement_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #headerWrapper_accessor_storage;
        get headerWrapper() { return this.#headerWrapper_accessor_storage; }
        set headerWrapper(value) { this.#headerWrapper_accessor_storage = value; }
        #contentElement_accessor_storage;
        get contentElement() { return this.#contentElement_accessor_storage; }
        set contentElement(value) { this.#contentElement_accessor_storage = value; }
        renderGfxBlock() {
            const { style, xywh$ } = this.model.props;
            const bound = Bound.deserialize(xywh$.value);
            this.embedContainerStyle.width = `${bound.w}px`;
            this.embedContainerStyle.height = `${bound.h}px`;
            this.cardStyleMap = {
                display: 'block',
                width: `${EMBED_CARD_WIDTH[style]}px`,
                height: `${EMBED_CARD_HEIGHT[style]}px`,
                transform: `scale(${bound.w / EMBED_CARD_WIDTH[style]}, ${bound.h / EMBED_CARD_HEIGHT[style]})`,
                transformOrigin: '0 0',
            };
            return this.renderPageContent();
        }
        #useCaptionEditor_accessor_storage;
        get useCaptionEditor() { return this.#useCaptionEditor_accessor_storage; }
        set useCaptionEditor(value) { this.#useCaptionEditor_accessor_storage = value; }
    };
})();
export { EmbedEdgelessSyncedDocBlockComponent };
