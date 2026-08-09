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
import { UserProvider } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { ZERO_WIDTH_FOR_EMBED_NODE, ZERO_WIDTH_FOR_EMPTY_LINE, } from '@blocksuite/std/inline';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
let AffineMention = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _delta_decorators;
    let _delta_initializers = [];
    let _delta_extraInitializers = [];
    let _selected_decorators;
    let _selected_initializers = [];
    let _selected_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    return class AffineMention extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _delta_decorators = [property({ type: Object })];
            _selected_decorators = [property({ type: Boolean })];
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _delta_decorators, { kind: "accessor", name: "delta", static: false, private: false, access: { has: obj => "delta" in obj, get: obj => obj.delta, set: (obj, value) => { obj.delta = value; } }, metadata: _metadata }, _delta_initializers, _delta_extraInitializers);
            __esDecorate(this, null, _selected_decorators, { kind: "accessor", name: "selected", static: false, private: false, access: { has: obj => "selected" in obj, get: obj => obj.selected, set: (obj, value) => { obj.selected = value; } }, metadata: _metadata }, _selected_initializers, _selected_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .affine-mention {
      color: ${unsafeCSSVarV2('text/primary')};
      font-feature-settings:
        'liga' off,
        'clig' off;
      /* Client/baseMedium */
      font-family: Inter;
      font-size: var(--affine-font-size-base);
      font-style: normal;
      font-weight: 500;
      line-height: 24px; /* 160% */
      padding: 0 4px;
      border-radius: 4px;
      user-select: none;
    }
    .affine-mention:hover {
      background: var(--affine-hover-color);
    }
    .affine-mention[data-selected='true'] {
      background: var(--affine-hover-color);
    }
    .affine-mention[data-type='default'] {
      color: ${unsafeCSSVarV2('text/primary')};
    }
    .affine-mention[data-type='removed'] {
      color: ${unsafeCSSVarV2('text/disable')};
    }
    .affine-mention[data-type='error'] {
      color: ${unsafeCSSVarV2('text/disable')};
    }
    .affine-mention[data-type='loading'] {
      color: ${unsafeCSSVarV2('text/placeholder')};
      background: ${unsafeCSSVarV2('skeleton/skeleton')};
    }
    .loading-text {
      display: inline-block;
    }
    .dots {
      display: inline-block;
    }
    .dot {
      display: inline-block;
      opacity: 0;
      animation: pulse 1.2s infinite;
    }
    .dots > .dot:nth-child(2) {
      animation-delay: 0.4s;
    }
    .dots > .dot:nth-child(3) {
      animation-delay: 0.8s;
    }
    @keyframes pulse {
      0% {
        opacity: 0;
      }
      33.333% {
        opacity: 1;
      }
      66.666% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `; }
        render() {
            const errorContent = html `<span
      data-selected=${this.selected}
      data-type="error"
      class="affine-mention"
      >@Unknown Member<v-text .str=${ZERO_WIDTH_FOR_EMBED_NODE}></v-text
    ></span>`;
            const userService = this.std.getOptional(UserProvider);
            const memberId = this.delta.attributes?.mention?.member;
            if (!userService || !memberId) {
                return errorContent;
            }
            userService.revalidateUserInfo(memberId);
            const isLoading$ = userService.isLoading$(memberId);
            const userInfo$ = userService.userInfo$(memberId);
            if (userInfo$.value) {
                if (userInfo$.value.removed) {
                    return html `<span
          data-selected=${this.selected}
          data-type="removed"
          class="affine-mention"
          >@Inactive Member<v-text .str=${ZERO_WIDTH_FOR_EMBED_NODE}></v-text
        ></span>`;
                }
                else {
                    return html `<span
          data-selected=${this.selected}
          data-type="default"
          class="affine-mention"
          >@${userInfo$.value.name ?? 'Unknown'}<v-text
            .str=${ZERO_WIDTH_FOR_EMBED_NODE}
          ></v-text
        ></span>`;
                }
            }
            if (isLoading$.value) {
                return html `<span
        data-selected=${this.selected}
        data-type="loading"
        class="affine-mention"
        >@loading<span class="dots"
          ><span class="dot">.</span><span class="dot">.</span
          ><span class="dot">.</span></span
        ><v-text .str=${ZERO_WIDTH_FOR_EMBED_NODE}></v-text
      ></span>`;
            }
            return errorContent;
        }
        #delta_accessor_storage = __runInitializers(this, _delta_initializers, {
            insert: ZERO_WIDTH_FOR_EMPTY_LINE,
            attributes: {},
        });
        get delta() { return this.#delta_accessor_storage; }
        set delta(value) { this.#delta_accessor_storage = value; }
        #selected_accessor_storage = (__runInitializers(this, _delta_extraInitializers), __runInitializers(this, _selected_initializers, false));
        get selected() { return this.#selected_accessor_storage; }
        set selected(value) { this.#selected_accessor_storage = value; }
        #std_accessor_storage = (__runInitializers(this, _selected_extraInitializers), __runInitializers(this, _std_initializers, void 0));
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _std_extraInitializers);
        }
    };
})();
export { AffineMention };
