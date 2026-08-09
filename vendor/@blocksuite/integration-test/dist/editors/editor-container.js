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
import { SignalWatcher, WithDisposable } from '@blocksuite/affine/global/lit';
import { ThemeProvider } from '@blocksuite/affine/shared/services';
import { BlockStdScope, ShadowlessElement } from '@blocksuite/affine/std';
import {} from '@blocksuite/affine/store';
import { computed, signal } from '@preact/signals-core';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { keyed } from 'lit/directives/keyed.js';
import { when } from 'lit/directives/when.js';
let TestAffineEditorContainer = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _autofocus_decorators;
    let _autofocus_initializers = [];
    let _autofocus_extraInitializers = [];
    return class TestAffineEditorContainer extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _autofocus_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _autofocus_decorators, { kind: "accessor", name: "autofocus", static: false, private: false, access: { has: obj => "autofocus" in obj, get: obj => obj.autofocus, set: (obj, value) => { obj.autofocus = value; } }, metadata: _metadata }, _autofocus_initializers, _autofocus_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .affine-page-viewport {
      position: relative;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
      container-name: viewport;
      container-type: inline-size;
      font-family: var(--affine-font-family);
    }
    .affine-page-viewport * {
      box-sizing: border-box;
    }

    @media print {
      .affine-page-viewport {
        height: auto;
      }
    }

    .playground-page-editor-container {
      flex-grow: 1;
      font-family: var(--affine-font-family);
      display: block;
    }

    .playground-page-editor-container * {
      box-sizing: border-box;
    }

    @media print {
      .playground-page-editor-container {
        height: auto;
      }
    }

    .edgeless-editor-container {
      font-family: var(--affine-font-family);
      background: var(--affine-background-primary-color);
      display: block;
      height: 100%;
      position: relative;
      overflow: clip;
    }

    .edgeless-editor-container * {
      box-sizing: border-box;
    }

    @media print {
      .edgeless-editor-container {
        height: auto;
      }
    }

    .affine-edgeless-viewport {
      display: block;
      height: 100%;
      position: relative;
      overflow: clip;
      container-name: viewport;
      container-type: inline-size;
    }
  `; }
        get doc() {
            return this._doc.value;
        }
        set doc(doc) {
            this._doc.value = doc;
        }
        set edgelessSpecs(specs) {
            this._edgelessSpecs.value = specs;
        }
        get edgelessSpecs() {
            return this._edgelessSpecs.value;
        }
        get host() {
            try {
                return this.std.host;
            }
            catch {
                return null;
            }
        }
        get mode() {
            return this._mode.value;
        }
        set mode(mode) {
            this._mode.value = mode;
        }
        set pageSpecs(specs) {
            this._pageSpecs.value = specs;
        }
        get pageSpecs() {
            return this._pageSpecs.value;
        }
        get rootModel() {
            return this.doc.root;
        }
        get std() {
            return this._std.value;
        }
        connectedCallback() {
            super.connectedCallback();
            this._disposables.add(this.doc.slots.rootAdded.subscribe(() => this.requestUpdate()));
        }
        firstUpdated() {
            if (this.mode === 'page') {
                setTimeout(() => {
                    if (this.autofocus && this.mode === 'page') {
                        const richText = this.querySelector('rich-text');
                        const inlineEditor = richText?.inlineEditor;
                        inlineEditor?.focusEnd();
                    }
                });
            }
        }
        render() {
            const mode = this._mode.value;
            const themeService = this.std.get(ThemeProvider);
            const appTheme = themeService.app$.value;
            const edgelessTheme = themeService.edgeless$.value;
            return html `${keyed(this.rootModel.id + mode, html `
        <div
          data-theme=${mode === 'page' ? appTheme : edgelessTheme}
          class=${mode === 'page'
                ? 'affine-page-viewport'
                : 'affine-edgeless-viewport'}
        >
          ${when(mode === 'page', () => html ` <doc-title .doc=${this.doc}></doc-title> `)}
          <div
            class=${mode === 'page'
                ? 'page-editor playground-page-editor-container'
                : 'edgeless-editor-container'}
          >
            ${this._editorTemplate.value}
          </div>
        </div>
      `)}`;
        }
        switchEditor(mode) {
            this._mode.value = mode;
        }
        #autofocus_accessor_storage;
        get autofocus() { return this.#autofocus_accessor_storage; }
        set autofocus(value) { this.#autofocus_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._doc = signal();
            this._edgelessSpecs = signal([]);
            this._mode = signal('page');
            this._pageSpecs = signal([]);
            this._specs = computed(() => this._mode.value === 'page'
                ? this._pageSpecs.value
                : this._edgelessSpecs.value);
            this._std = computed(() => {
                return new BlockStdScope({
                    store: this.doc,
                    extensions: this._specs.value,
                });
            });
            this._editorTemplate = computed(() => {
                return this._std.value.render();
            });
            this.#autofocus_accessor_storage = __runInitializers(this, _autofocus_initializers, false);
            __runInitializers(this, _autofocus_extraInitializers);
        }
    };
})();
export { TestAffineEditorContainer };
