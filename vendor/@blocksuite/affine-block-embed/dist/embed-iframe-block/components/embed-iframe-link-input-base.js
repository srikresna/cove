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
import { EmbedIframeService, NotificationProvider, } from '@blocksuite/affine-shared/services';
import { isValidUrl, stopPropagation } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { noop } from '@blocksuite/global/utils';
import { BlockSelection, SurfaceSelection, } from '@blocksuite/std';
import { LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
let EmbedIframeLinkInputBase = (() => {
    let _classSuper = WithDisposable(LitElement);
    let __linkInputValue_decorators;
    let __linkInputValue_initializers = [];
    let __linkInputValue_extraInitializers = [];
    let _input_decorators;
    let _input_initializers = [];
    let _input_extraInitializers = [];
    let _model_decorators;
    let _model_initializers = [];
    let _model_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _abortController_decorators;
    let _abortController_initializers = [];
    let _abortController_extraInitializers = [];
    let _inSurface_decorators;
    let _inSurface_initializers = [];
    let _inSurface_extraInitializers = [];
    return class EmbedIframeLinkInputBase extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __linkInputValue_decorators = [state()];
            _input_decorators = [query('input')];
            _model_decorators = [property({ attribute: false })];
            _std_decorators = [property({ attribute: false })];
            _abortController_decorators = [property({ attribute: false })];
            _inSurface_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __linkInputValue_decorators, { kind: "accessor", name: "_linkInputValue", static: false, private: false, access: { has: obj => "_linkInputValue" in obj, get: obj => obj._linkInputValue, set: (obj, value) => { obj._linkInputValue = value; } }, metadata: _metadata }, __linkInputValue_initializers, __linkInputValue_extraInitializers);
            __esDecorate(this, null, _input_decorators, { kind: "accessor", name: "input", static: false, private: false, access: { has: obj => "input" in obj, get: obj => obj.input, set: (obj, value) => { obj.input = value; } }, metadata: _metadata }, _input_initializers, _input_extraInitializers);
            __esDecorate(this, null, _model_decorators, { kind: "accessor", name: "model", static: false, private: false, access: { has: obj => "model" in obj, get: obj => obj.model, set: (obj, value) => { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _abortController_decorators, { kind: "accessor", name: "abortController", static: false, private: false, access: { has: obj => "abortController" in obj, get: obj => obj.abortController, set: (obj, value) => { obj.abortController = value; } }, metadata: _metadata }, _abortController_initializers, _abortController_extraInitializers);
            __esDecorate(this, null, _inSurface_decorators, { kind: "accessor", name: "inSurface", static: false, private: false, access: { has: obj => "inSurface" in obj, get: obj => obj.inSurface, set: (obj, value) => { obj.inSurface = value; } }, metadata: _metadata }, _inSurface_initializers, _inSurface_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // this method is used to track the event when the user inputs the link
        // it should be overridden by the subclass
        track(status) {
            noop(status);
        }
        isInputEmpty() {
            return this._linkInputValue.trim() === '';
        }
        tryToAddBookmark(url) {
            if (!isValidUrl(url)) {
                this.notificationService?.notify({
                    title: 'Invalid URL',
                    message: 'Please enter a valid URL',
                    accent: 'error',
                    onClose: function () { },
                });
                return;
            }
            const { model } = this;
            const { parent } = model;
            const index = parent?.children.indexOf(model);
            const flavour = 'affine:bookmark';
            this.store.transact(() => {
                const blockId = this.store.addBlock(flavour, { url }, parent, index);
                this.store.deleteBlock(model);
                if (this.inSurface) {
                    this.std.selection.setGroup('gfx', [
                        this.std.selection.create(SurfaceSelection, blockId, [blockId], false),
                    ]);
                }
                else {
                    this.std.selection.setGroup('note', [
                        this.std.selection.create(BlockSelection, { blockId }),
                    ]);
                }
            });
            this.abortController?.abort();
        }
        async onConfirm() {
            if (this.isInputEmpty()) {
                return;
            }
            try {
                const embedIframeService = this.std.get(EmbedIframeService);
                if (!embedIframeService) {
                    console.error('iframe EmbedIframeService not found');
                    this.track('failure');
                    return;
                }
                const url = this._linkInputValue;
                const canEmbed = embedIframeService.canEmbed(url);
                if (!canEmbed) {
                    console.log('iframe can not be embedded, add as a bookmark', url);
                    this.tryToAddBookmark(url);
                    return;
                }
                this.store.updateBlock(this.model, {
                    url: this._linkInputValue,
                    iframeUrl: '',
                    title: '',
                    description: '',
                });
                this.track('success');
            }
            catch (error) {
                this.track('failure');
                this.notificationService?.notify({
                    title: 'Error in embed iframe creation',
                    message: error instanceof Error ? error.message : 'Please try again',
                    accent: 'error',
                    onClose: function () { },
                });
            }
            finally {
                this.abortController?.abort();
            }
        }
        connectedCallback() {
            super.connectedCallback();
            this.updateComplete
                .then(() => {
                requestAnimationFrame(() => {
                    this.input.focus();
                });
            })
                .catch(console.error);
            this.disposables.addFromEvent(this, 'cut', stopPropagation);
            this.disposables.addFromEvent(this, 'copy', stopPropagation);
            this.disposables.addFromEvent(this, 'paste', stopPropagation);
            this.disposables.addFromEvent(this, 'pointerdown', stopPropagation);
        }
        get store() {
            return this.model.store;
        }
        get notificationService() {
            return this.std.getOptional(NotificationProvider);
        }
        #_linkInputValue_accessor_storage;
        get _linkInputValue() { return this.#_linkInputValue_accessor_storage; }
        set _linkInputValue(value) { this.#_linkInputValue_accessor_storage = value; }
        #input_accessor_storage;
        get input() { return this.#input_accessor_storage; }
        set input(value) { this.#input_accessor_storage = value; }
        #model_accessor_storage;
        get model() { return this.#model_accessor_storage; }
        set model(value) { this.#model_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #abortController_accessor_storage;
        get abortController() { return this.#abortController_accessor_storage; }
        set abortController(value) { this.#abortController_accessor_storage = value; }
        #inSurface_accessor_storage;
        get inSurface() { return this.#inSurface_accessor_storage; }
        set inSurface(value) { this.#inSurface_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.handleInput = (e) => {
                const target = e.target;
                this._linkInputValue = target.value;
            };
            this.handleKeyDown = async (e) => {
                e.stopPropagation();
                if (e.key === 'Enter' && !e.isComposing) {
                    await this.onConfirm();
                }
            };
            this.#_linkInputValue_accessor_storage = __runInitializers(this, __linkInputValue_initializers, '');
            this.#input_accessor_storage = (__runInitializers(this, __linkInputValue_extraInitializers), __runInitializers(this, _input_initializers, void 0));
            this.#model_accessor_storage = (__runInitializers(this, _input_extraInitializers), __runInitializers(this, _model_initializers, void 0));
            this.#std_accessor_storage = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            this.#abortController_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _abortController_initializers, undefined));
            this.#inSurface_accessor_storage = (__runInitializers(this, _abortController_extraInitializers), __runInitializers(this, _inSurface_initializers, false));
            __runInitializers(this, _inSurface_extraInitializers);
        }
    };
})();
export { EmbedIframeLinkInputBase };
