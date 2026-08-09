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
import { PaletteIcon } from '@blocksuite/icons/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { computed, } from '@preact/signals-core';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { EmbedCardDarkCubeIcon, EmbedCardDarkHorizontalIcon, EmbedCardDarkListIcon, EmbedCardDarkVerticalIcon, EmbedCardLightCubeIcon, EmbedCardLightHorizontalIcon, EmbedCardLightListIcon, EmbedCardLightVerticalIcon, } from '../icons';
const cardStyleMap = {
    light: {
        cube: EmbedCardLightCubeIcon,
        cubeThick: EmbedCardLightCubeIcon,
        horizontal: EmbedCardLightHorizontalIcon,
        horizontalThin: EmbedCardLightListIcon,
        list: EmbedCardLightListIcon,
        vertical: EmbedCardLightVerticalIcon,
    },
    dark: {
        cube: EmbedCardDarkCubeIcon,
        cubeThick: EmbedCardDarkCubeIcon,
        horizontal: EmbedCardDarkHorizontalIcon,
        horizontalThin: EmbedCardDarkListIcon,
        list: EmbedCardDarkListIcon,
        vertical: EmbedCardDarkVerticalIcon,
    },
};
let CardStyleDropdownMenu = (() => {
    let _classDecorators = [requiredProperties({
            actions: PropTypes.array,
            context: PropTypes.instanceOf(ToolbarContext),
            styleSignal: PropTypes.object,
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
    let _styleSignal_decorators;
    let _styleSignal_initializers = [];
    let _styleSignal_extraInitializers = [];
    var CardStyleDropdownMenu = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#actions_accessor_storage = __runInitializers(this, _actions_initializers, void 0);
            this.#context_accessor_storage = (__runInitializers(this, _actions_extraInitializers), __runInitializers(this, _context_initializers, void 0));
            this.#styleSignal_accessor_storage = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _styleSignal_initializers, void 0));
            this.icons$ = (__runInitializers(this, _styleSignal_extraInitializers), computed(() => cardStyleMap[this.context.theme.theme$.value]));
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _actions_decorators = [property({ attribute: false })];
            _context_decorators = [property({ attribute: false })];
            _styleSignal_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _actions_decorators, { kind: "accessor", name: "actions", static: false, private: false, access: { has: obj => "actions" in obj, get: obj => obj.actions, set: (obj, value) => { obj.actions = value; } }, metadata: _metadata }, _actions_initializers, _actions_extraInitializers);
            __esDecorate(this, null, _context_decorators, { kind: "accessor", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(this, null, _styleSignal_decorators, { kind: "accessor", name: "styleSignal", static: false, private: false, access: { has: obj => "styleSignal" in obj, get: obj => obj.styleSignal, set: (obj, value) => { obj.styleSignal = value; } }, metadata: _metadata }, _styleSignal_initializers, _styleSignal_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CardStyleDropdownMenu = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #actions_accessor_storage;
        get actions() { return this.#actions_accessor_storage; }
        set actions(value) { this.#actions_accessor_storage = value; }
        #context_accessor_storage;
        get context() { return this.#context_accessor_storage; }
        set context(value) { this.#context_accessor_storage = value; }
        #styleSignal_accessor_storage;
        get styleSignal() { return this.#styleSignal_accessor_storage; }
        set styleSignal(value) { this.#styleSignal_accessor_storage = value; }
        render() {
            const { actions, context, styleSignal: { value: style }, icons$: { value: icons }, } = this;
            return html `
      <editor-menu-button
        .contentPadding="${'8px'}"
        .button=${html `
          <editor-icon-button
            aria-label="Card style"
            .tooltip="${'Card style'}"
          >
            ${PaletteIcon()}
          </editor-icon-button>
        `}
      >
        <div>
          ${repeat(actions, action => action.id, ({ id, label, icon, disabled, run }) => html `
              <editor-icon-button
                aria-label="${ifDefined(label)}"
                data-testid="${id}"
                .tooltip="${label}"
                .activeMode="${'border'}"
                .iconContainerWidth="${'76px'}"
                .iconContainerHeight="${'76px'}"
                .justify="${'center'}"
                ?active="${id === style}"
                ?disabled="${ifDefined(disabled)}"
                @click=${() => run?.(context)}
              >
                ${icon || icons[id]}
              </editor-icon-button>
            `)}
        </div>
      </editor-menu-button>
    `;
        }
    };
    return CardStyleDropdownMenu = _classThis;
})();
export { CardStyleDropdownMenu };
