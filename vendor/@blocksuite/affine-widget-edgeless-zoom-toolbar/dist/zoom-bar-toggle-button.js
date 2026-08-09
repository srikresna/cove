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
import { EdgelessLegacySlotIdentifier } from '@blocksuite/affine-block-surface';
import { createLitPortal } from '@blocksuite/affine-components/portal';
import { stopPropagation } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { MoreHorizontalIcon } from '@blocksuite/icons/lit';
import { offset } from '@floating-ui/dom';
import { css, html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
let ZoomBarToggleButton = (() => {
    let _classSuper = WithDisposable(LitElement);
    let __showPopper_decorators;
    let __showPopper_initializers = [];
    let __showPopper_extraInitializers = [];
    let __toggleButton_decorators;
    let __toggleButton_initializers = [];
    let __toggleButton_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    return class ZoomBarToggleButton extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __showPopper_decorators = [state()];
            __toggleButton_decorators = [query('.toggle-button')];
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __showPopper_decorators, { kind: "accessor", name: "_showPopper", static: false, private: false, access: { has: obj => "_showPopper" in obj, get: obj => obj._showPopper, set: (obj, value) => { obj._showPopper = value; } }, metadata: _metadata }, __showPopper_initializers, __showPopper_extraInitializers);
            __esDecorate(this, null, __toggleButton_decorators, { kind: "accessor", name: "_toggleButton", static: false, private: false, access: { has: obj => "_toggleButton" in obj, get: obj => obj._toggleButton, set: (obj, value) => { obj._toggleButton = value; } }, metadata: _metadata }, __toggleButton_initializers, __toggleButton_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
    }
    .toggle-button {
      display: flex;
      position: relative;
    }
    edgeless-zoom-toolbar {
      position: absolute;
      bottom: initial;
    }
  `; }
        _closeZoomMenu() {
            if (this._abortController && !this._abortController.signal.aborted) {
                this._abortController.abort();
                this._abortController = null;
                this._showPopper = false;
            }
        }
        get _slots() {
            return this.std.get(EdgelessLegacySlotIdentifier);
        }
        _toggleZoomMenu() {
            if (this._abortController && !this._abortController.signal.aborted) {
                this._closeZoomMenu();
                return;
            }
            this._abortController = new AbortController();
            this._abortController.signal.addEventListener('abort', () => {
                this._showPopper = false;
            });
            createLitPortal({
                template: html `<edgeless-zoom-toolbar
        .std=${this.std}
        .layout=${'vertical'}
      ></edgeless-zoom-toolbar>`,
                container: this._toggleButton,
                computePosition: {
                    referenceElement: this._toggleButton,
                    placement: 'top',
                    middleware: [offset(4)],
                    autoUpdate: true,
                },
                abortController: this._abortController,
                closeOnClickAway: true,
            });
            this._showPopper = true;
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._closeZoomMenu();
        }
        firstUpdated() {
            const { disposables } = this;
            disposables.add(this._slots.readonlyUpdated.subscribe(() => {
                this.requestUpdate();
            }));
        }
        render() {
            if (this.std.store.readonly) {
                return nothing;
            }
            return html `
      <div class="toggle-button" @pointerdown=${stopPropagation}>
        <edgeless-tool-icon-button
          .tooltip=${'Toggle Zoom Tool Bar'}
          .tipPosition=${'right'}
          .active=${this._showPopper}
          .arrow=${false}
          .activeMode=${'background'}
          .iconContainerPadding=${6}
          .iconSize=${'24px'}
          @click=${() => this._toggleZoomMenu()}
        >
          ${MoreHorizontalIcon()}
        </edgeless-tool-icon-button>
      </div>
    `;
        }
        #_showPopper_accessor_storage;
        get _showPopper() { return this.#_showPopper_accessor_storage; }
        set _showPopper(value) { this.#_showPopper_accessor_storage = value; }
        #_toggleButton_accessor_storage;
        get _toggleButton() { return this.#_toggleButton_accessor_storage; }
        set _toggleButton(value) { this.#_toggleButton_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._abortController = null;
            this.#_showPopper_accessor_storage = __runInitializers(this, __showPopper_initializers, false);
            this.#_toggleButton_accessor_storage = (__runInitializers(this, __showPopper_extraInitializers), __runInitializers(this, __toggleButton_initializers, void 0));
            this.#std_accessor_storage = (__runInitializers(this, __toggleButton_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            __runInitializers(this, _std_extraInitializers);
        }
    };
})();
export { ZoomBarToggleButton };
