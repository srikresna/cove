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
import { ToolbarContext, } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { EditorChevronDown } from '../toolbar';
let OpenDocDropdownMenu = (() => {
    let _classDecorators = [requiredProperties({
            actions: PropTypes.array,
            context: PropTypes.instanceOf(ToolbarContext),
            openDocModeSignal: PropTypes.object,
            updateOpenDocMode: PropTypes.instanceOf(Function),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _actions_decorators;
    let _actions_initializers = [];
    let _actions_extraInitializers = [];
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _openDocModeSignal_decorators;
    let _openDocModeSignal_initializers = [];
    let _openDocModeSignal_extraInitializers = [];
    let _updateOpenDocMode_decorators;
    let _updateOpenDocMode_initializers = [];
    let _updateOpenDocMode_extraInitializers = [];
    var OpenDocDropdownMenu = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#actions_accessor_storage = __runInitializers(this, _actions_initializers, void 0);
            this.#context_accessor_storage = (__runInitializers(this, _actions_extraInitializers), __runInitializers(this, _context_initializers, void 0));
            this.#openDocModeSignal_accessor_storage = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _openDocModeSignal_initializers, void 0));
            this.#updateOpenDocMode_accessor_storage = (__runInitializers(this, _openDocModeSignal_extraInitializers), __runInitializers(this, _updateOpenDocMode_initializers, void 0));
            this.currentAction$ = (__runInitializers(this, _updateOpenDocMode_extraInitializers), computed(() => {
                const currentOpenDocMode = this.openDocModeSignal.value;
                return (this.actions.find(a => a.mode === currentOpenDocMode) ?? this.actions[0]);
            }));
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _actions_decorators = [property({ attribute: false })];
            _context_decorators = [property({ attribute: false })];
            _openDocModeSignal_decorators = [property({ attribute: false })];
            _updateOpenDocMode_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _actions_decorators, { kind: "accessor", name: "actions", static: false, private: false, access: { has: obj => "actions" in obj, get: obj => obj.actions, set: (obj, value) => { obj.actions = value; } }, metadata: _metadata }, _actions_initializers, _actions_extraInitializers);
            __esDecorate(this, null, _context_decorators, { kind: "accessor", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(this, null, _openDocModeSignal_decorators, { kind: "accessor", name: "openDocModeSignal", static: false, private: false, access: { has: obj => "openDocModeSignal" in obj, get: obj => obj.openDocModeSignal, set: (obj, value) => { obj.openDocModeSignal = value; } }, metadata: _metadata }, _openDocModeSignal_initializers, _openDocModeSignal_extraInitializers);
            __esDecorate(this, null, _updateOpenDocMode_decorators, { kind: "accessor", name: "updateOpenDocMode", static: false, private: false, access: { has: obj => "updateOpenDocMode" in obj, get: obj => obj.updateOpenDocMode, set: (obj, value) => { obj.updateOpenDocMode = value; } }, metadata: _metadata }, _updateOpenDocMode_initializers, _updateOpenDocMode_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OpenDocDropdownMenu = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
      gap: unset !important;
    }

    div[data-orientation] {
      width: 264px;
      gap: 4px;
      min-width: unset;
      overflow: unset;
    }

    editor-menu-action {
      .label {
        display: flex;
        flex: 1;
        justify-content: space-between;
      }

      .shortcut {
        color: ${unsafeCSSVarV2('text/secondary')};
      }
    }
  `; }
        #actions_accessor_storage;
        get actions() { return this.#actions_accessor_storage; }
        set actions(value) { this.#actions_accessor_storage = value; }
        #context_accessor_storage;
        get context() { return this.#context_accessor_storage; }
        set context(value) { this.#context_accessor_storage = value; }
        #openDocModeSignal_accessor_storage;
        get openDocModeSignal() { return this.#openDocModeSignal_accessor_storage; }
        set openDocModeSignal(value) { this.#openDocModeSignal_accessor_storage = value; }
        #updateOpenDocMode_accessor_storage;
        get updateOpenDocMode() { return this.#updateOpenDocMode_accessor_storage; }
        set updateOpenDocMode(value) { this.#updateOpenDocMode_accessor_storage = value; }
        render() {
            const { actions, context, updateOpenDocMode, currentAction$: { value: currentAction }, } = this;
            return html `
      <editor-icon-button
        aria-label="${currentAction.label}"
        .tooltip="${currentAction.label}"
        @click=${() => currentAction.run?.(context)}
      >
        ${currentAction.icon}
        <span class="label">Open</span>
      </editor-icon-button>
      <editor-menu-button
        aria-label="Open doc menu"
        .contentPadding="${'8px'}"
        .button=${html `
          <editor-icon-button aria-label="Open doc with">
            ${EditorChevronDown}
          </editor-icon-button>
        `}
      >
        <div data-orientation="vertical">
          ${repeat(actions, action => action.id, ({ label, icon, run, disabled, mode, shortcut }) => html `
              <editor-menu-action
                aria-label=${ifDefined(label)}
                ?disabled=${ifDefined(disabled)}
                @click=${() => {
                run?.(context);
                updateOpenDocMode(mode);
            }}
              >
                ${icon}
                <div class="label">
                  ${label}
                  <span class="shortcut">${shortcut}</span>
                </div>
              </editor-menu-action>
            `)}
        </div>
      </editor-menu-button>
    `;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return OpenDocDropdownMenu = _classThis;
})();
export { OpenDocDropdownMenu };
