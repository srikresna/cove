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
import { SignalWatcher } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { EditorChevronDown } from '../toolbar';
let ViewDropdownMenu = (() => {
    let _classDecorators = [requiredProperties({
            actions: PropTypes.array,
            context: PropTypes.instanceOf(ToolbarContext),
            viewTypeSignal: PropTypes.object,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(LitElement);
    let _actions_decorators;
    let _actions_initializers = [];
    let _actions_extraInitializers = [];
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _viewTypeSignal_decorators;
    let _viewTypeSignal_initializers = [];
    let _viewTypeSignal_extraInitializers = [];
    var ViewDropdownMenu = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _actions_decorators = [property({ attribute: false })];
            _context_decorators = [property({ attribute: false })];
            _viewTypeSignal_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _actions_decorators, { kind: "accessor", name: "actions", static: false, private: false, access: { has: obj => "actions" in obj, get: obj => obj.actions, set: (obj, value) => { obj.actions = value; } }, metadata: _metadata }, _actions_initializers, _actions_extraInitializers);
            __esDecorate(this, null, _context_decorators, { kind: "accessor", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(this, null, _viewTypeSignal_decorators, { kind: "accessor", name: "viewTypeSignal", static: false, private: false, access: { has: obj => "viewTypeSignal" in obj, get: obj => obj.viewTypeSignal, set: (obj, value) => { obj.viewTypeSignal = value; } }, metadata: _metadata }, _viewTypeSignal_initializers, _viewTypeSignal_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ViewDropdownMenu = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #actions_accessor_storage = __runInitializers(this, _actions_initializers, void 0);
        get actions() { return this.#actions_accessor_storage; }
        set actions(value) { this.#actions_accessor_storage = value; }
        #context_accessor_storage = (__runInitializers(this, _actions_extraInitializers), __runInitializers(this, _context_initializers, void 0));
        get context() { return this.#context_accessor_storage; }
        set context(value) { this.#context_accessor_storage = value; }
        #viewTypeSignal_accessor_storage = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _viewTypeSignal_initializers, void 0));
        get viewTypeSignal() { return this.#viewTypeSignal_accessor_storage; }
        set viewTypeSignal(value) { this.#viewTypeSignal_accessor_storage = value; }
        render() {
            const { actions, context, viewTypeSignal: { value: viewType }, } = this;
            return html `
      <editor-menu-button
        .contentPadding="${'8px'}"
        .button=${html `
          <editor-icon-button
            aria-label="Switch view"
            .tooltip="${'Switch view'}"
            .justify="${'space-between'}"
            .labelHeight="${'20px'}"
            .iconContainerWidth="${'110px'}"
          >
            <span class="label">${viewType}</span>
            ${EditorChevronDown}
          </editor-icon-button>
        `}
      >
        <div data-size="small" data-orientation="vertical">
          ${repeat(actions.filter(action => {
                if (typeof action.when === 'function')
                    return action.when(context);
                return action.when ?? true;
            }), action => action.id, ({ id, label, disabled, run }) => html `
              <editor-menu-action
                aria-label="${ifDefined(label)}"
                data-testid="${`link-to-${id}`}"
                ?data-selected="${label === viewType}"
                ?disabled="${ifDefined(typeof disabled === 'function' ? disabled(context) : disabled)}"
                @click=${() => run?.(context)}
              >
                ${label}
              </editor-menu-action>
            `)}
        </div>
      </editor-menu-button>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _viewTypeSignal_extraInitializers);
        }
    };
    return ViewDropdownMenu = _classThis;
})();
export { ViewDropdownMenu };
