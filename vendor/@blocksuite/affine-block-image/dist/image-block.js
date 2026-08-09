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
import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { whenHover } from '@blocksuite/affine-components/hover';
import { LoadingIcon } from '@blocksuite/affine-components/icons';
import { Peekable } from '@blocksuite/affine-components/peek';
import { ResourceController } from '@blocksuite/affine-components/resource';
import { ImageSelection } from '@blocksuite/affine-shared/selection';
import { BlockElementCommentManager, ToolbarRegistryIdentifier, } from '@blocksuite/affine-shared/services';
import { formatSize } from '@blocksuite/affine-shared/utils';
import { IS_MOBILE } from '@blocksuite/global/env';
import { BrokenImageIcon, ImageIcon } from '@blocksuite/icons/lit';
import { BlockSelection } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { html } from 'lit';
import { query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import { copyImageBlob, downloadImageBlob, refreshData, turnImageIntoCardView, } from './utils';
let ImageBlockComponent = (() => {
    let _classDecorators = [Peekable({
            enableOn: () => !IS_MOBILE,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = CaptionedBlockComponent;
    let _pageImage_decorators;
    let _pageImage_initializers = [];
    let _pageImage_extraInitializers = [];
    let _hoverableContainer_decorators;
    let _hoverableContainer_initializers = [];
    let _hoverableContainer_extraInitializers = [];
    var ImageBlockComponent = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.resizeable$ = computed(() => this.std.selection.value.some(selection => selection.is(ImageSelection) && selection.blockId === this.blockId));
            this.resourceController = new ResourceController(computed(() => this.model.props.sourceId$.value), 'Image');
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
            this.#blockContainerStyles_accessor_storage = { margin: '18px 0' };
            this.#pageImage_accessor_storage = __runInitializers(this, _pageImage_initializers, null);
            this.#hoverableContainer_accessor_storage = (__runInitializers(this, _pageImage_extraInitializers), __runInitializers(this, _hoverableContainer_initializers, void 0));
            this.#useCaptionEditor_accessor_storage = (__runInitializers(this, _hoverableContainer_extraInitializers), true);
            this.#useZeroWidth_accessor_storage = true;
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _pageImage_decorators = [query('affine-page-image')];
            _hoverableContainer_decorators = [query('.affine-image-container')];
            __esDecorate(this, null, _pageImage_decorators, { kind: "accessor", name: "pageImage", static: false, private: false, access: { has: obj => "pageImage" in obj, get: obj => obj.pageImage, set: (obj, value) => { obj.pageImage = value; } }, metadata: _metadata }, _pageImage_initializers, _pageImage_extraInitializers);
            __esDecorate(this, null, _hoverableContainer_decorators, { kind: "accessor", name: "hoverableContainer", static: false, private: false, access: { has: obj => "hoverableContainer" in obj, get: obj => obj.hoverableContainer, set: (obj, value) => { obj.hoverableContainer = value; } }, metadata: _metadata }, _hoverableContainer_initializers, _hoverableContainer_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ImageBlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get blobUrl() {
            return this.resourceController.blobUrl$.value;
        }
        get resizableImg() {
            return this.pageImage?.resizeImg;
        }
        get isCommentHighlighted() {
            return (this.std
                .getOptional(BlockElementCommentManager)
                ?.isBlockCommentHighlighted(this.model) ?? false);
        }
        _handleClick(event) {
            // the peek view need handle shift + click
            if (event.defaultPrevented)
                return;
            event.stopPropagation();
            const selectionManager = this.host.selection;
            const blockSelection = selectionManager.create(BlockSelection, {
                blockId: this.blockId,
            });
            selectionManager.setGroup('note', [blockSelection]);
        }
        _initHover() {
            const { setReference, setFloating, dispose } = whenHover(hovered => {
                const message$ = this.std.get(ToolbarRegistryIdentifier).message$;
                if (hovered) {
                    message$.value = {
                        flavour: this.model.flavour,
                        element: this,
                        setFloating,
                    };
                    return;
                }
                // Clears previous bindings
                message$.value = null;
                setFloating();
            }, { enterDelay: 500 });
            setReference(this.hoverableContainer);
            this._disposables.add(dispose);
        }
        connectedCallback() {
            super.connectedCallback();
            this.contentEditable = 'false';
            this.resourceController.setEngine(this.std.store.blobSync);
            this.disposables.add(this.resourceController.subscribe());
            this.disposables.add(this.resourceController);
            this.disposables.add(this.model.props.sourceId$.subscribe(() => {
                this.refreshData();
            }));
        }
        firstUpdated() {
            // lazy bindings
            this.disposables.addFromEvent(this, 'click', this._handleClick);
            this._initHover();
        }
        renderBlock() {
            const blobUrl = this.blobUrl;
            const { size = 0 } = this.model.props;
            const containerStyleMap = styleMap({
                position: 'relative',
                width: '100%',
            });
            const alignItemsStyleMap = styleMap({
                alignItems: this.model.props.textAlign$.value === 'left'
                    ? 'flex-start'
                    : this.model.props.textAlign$.value === 'right'
                        ? 'flex-end'
                        : undefined,
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
            return html `
      <div class="affine-image-container" style=${containerStyleMap}>
        ${when(blobUrl, () => html `<affine-page-image
              .block=${this}
              .state=${resovledState}
              style="${alignItemsStyleMap}"
            ></affine-page-image>`, () => html `<affine-image-fallback-card
              .state=${resovledState}
            ></affine-image-fallback-card>`)}
      </div>

      ${Object.values(this.widgets)}
    `;
        }
        #blockContainerStyles_accessor_storage;
        get blockContainerStyles() { return this.#blockContainerStyles_accessor_storage; }
        set blockContainerStyles(value) { this.#blockContainerStyles_accessor_storage = value; }
        #pageImage_accessor_storage;
        get pageImage() { return this.#pageImage_accessor_storage; }
        set pageImage(value) { this.#pageImage_accessor_storage = value; }
        #hoverableContainer_accessor_storage;
        get hoverableContainer() { return this.#hoverableContainer_accessor_storage; }
        set hoverableContainer(value) { this.#hoverableContainer_accessor_storage = value; }
        #useCaptionEditor_accessor_storage;
        get useCaptionEditor() { return this.#useCaptionEditor_accessor_storage; }
        set useCaptionEditor(value) { this.#useCaptionEditor_accessor_storage = value; }
        #useZeroWidth_accessor_storage;
        get useZeroWidth() { return this.#useZeroWidth_accessor_storage; }
        set useZeroWidth(value) { this.#useZeroWidth_accessor_storage = value; }
    };
    return ImageBlockComponent = _classThis;
})();
export { ImageBlockComponent };
