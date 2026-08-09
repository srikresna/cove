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
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties, ShadowlessElement, } from '@blocksuite/std';
import { provide } from '@lit/context';
import { effect, signal } from '@preact/signals-core';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { outlineSettingsKey, tocContext } from './config.js';
import * as styles from './outline-panel.css';
export const AFFINE_OUTLINE_PANEL = 'affine-outline-panel';
let OutlinePanel = (() => {
    let _classDecorators = [requiredProperties({
            editor: PropTypes.object,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    let _editor_decorators;
    let _editor_initializers = [];
    let _editor_extraInitializers = [];
    let _fitPadding_decorators;
    let _fitPadding_initializers = [];
    let _fitPadding_extraInitializers = [];
    var OutlinePanel = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __context_decorators = [provide({ context: tocContext })];
            _editor_decorators = [property({ attribute: false })];
            _fitPadding_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            __esDecorate(this, null, _editor_decorators, { kind: "accessor", name: "editor", static: false, private: false, access: { has: obj => "editor" in obj, get: obj => obj.editor, set: (obj, value) => { obj.editor = value; } }, metadata: _metadata }, _editor_initializers, _editor_extraInitializers);
            __esDecorate(this, null, _fitPadding_decorators, { kind: "accessor", name: "fitPadding", static: false, private: false, access: { has: obj => "fitPadding" in obj, get: obj => obj.fitPadding, set: (obj, value) => { obj.fitPadding = value; } }, metadata: _metadata }, _fitPadding_initializers, _fitPadding_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OutlinePanel = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        _getEditorMode(host) {
            const docModeService = host.std.get(DocModeProvider);
            const mode = docModeService.getEditorMode();
            return mode;
        }
        _setContext() {
            this._context = {
                editor$: signal(this.editor),
                showIcons$: signal(false),
                enableSorting$: signal(false),
                fitPadding$: signal(this.fitPadding),
            };
            this.disposables.add(effect(() => {
                const settingsString = localStorage.getItem(outlineSettingsKey);
                const settings = settingsString ? JSON.parse(settingsString) : null;
                if (settings) {
                    this._context.showIcons$.value = settings.showIcons;
                }
                const editor = this._context.editor$.value;
                if (this._getEditorMode(editor) === 'edgeless') {
                    this._context.enableSorting$.value = true;
                }
                else if (settings) {
                    this._context.enableSorting$.value = settings.enableSorting;
                }
            }));
        }
        _watchSettingsChange() {
            this.disposables.add(effect(() => {
                if (this._getEditorMode(this._context.editor$.value) === 'edgeless')
                    return;
                const showPreviewIcon = this._context.showIcons$.value;
                const enableNotesSorting = this._context.enableSorting$.value;
                localStorage.setItem(outlineSettingsKey, JSON.stringify({
                    showIcons: showPreviewIcon,
                    enableSorting: enableNotesSorting,
                }));
            }));
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add(styles.outlinePanel);
            this._setContext();
            this._watchSettingsChange();
        }
        willUpdate(changedProperties) {
            if (changedProperties.has('editor')) {
                this._context.editor$.value = this.editor;
            }
            if (changedProperties.has('fitPadding')) {
                this._context.fitPadding$.value = this.fitPadding;
            }
        }
        render() {
            if (!this.editor)
                return;
            return html `
      <affine-outline-panel-header></affine-outline-panel-header>
      <affine-outline-panel-body> </affine-outline-panel-body>
      <affine-outline-notice></affine-outline-notice>
    `;
        }
        #_context_accessor_storage = __runInitializers(this, __context_initializers, void 0);
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        #editor_accessor_storage = (__runInitializers(this, __context_extraInitializers), __runInitializers(this, _editor_initializers, void 0));
        get editor() { return this.#editor_accessor_storage; }
        set editor(value) { this.#editor_accessor_storage = value; }
        #fitPadding_accessor_storage = (__runInitializers(this, _editor_extraInitializers), __runInitializers(this, _fitPadding_initializers, void 0));
        get fitPadding() { return this.#fitPadding_accessor_storage; }
        set fitPadding(value) { this.#fitPadding_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _fitPadding_extraInitializers);
        }
    };
    return OutlinePanel = _classThis;
})();
export { OutlinePanel };
