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
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit-html/directives/repeat.js';
let TooltipContentWithShortcut = (() => {
    let _classSuper = LitElement;
    let _tip_decorators;
    let _tip_initializers = [];
    let _tip_extraInitializers = [];
    let _shortcut_decorators;
    let _shortcut_initializers = [];
    let _shortcut_extraInitializers = [];
    let _postfix_decorators;
    let _postfix_initializers = [];
    let _postfix_extraInitializers = [];
    return class TooltipContentWithShortcut extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _tip_decorators = [property({ attribute: 'data-tip' })];
            _shortcut_decorators = [property({ attribute: 'data-shortcut' })];
            _postfix_decorators = [property({ attribute: 'data-postfix' })];
            __esDecorate(this, null, _tip_decorators, { kind: "accessor", name: "tip", static: false, private: false, access: { has: obj => "tip" in obj, get: obj => obj.tip, set: (obj, value) => { obj.tip = value; } }, metadata: _metadata }, _tip_initializers, _tip_extraInitializers);
            __esDecorate(this, null, _shortcut_decorators, { kind: "accessor", name: "shortcut", static: false, private: false, access: { has: obj => "shortcut" in obj, get: obj => obj.shortcut, set: (obj, value) => { obj.shortcut = value; } }, metadata: _metadata }, _shortcut_initializers, _shortcut_extraInitializers);
            __esDecorate(this, null, _postfix_decorators, { kind: "accessor", name: "postfix", static: false, private: false, access: { has: obj => "postfix" in obj, get: obj => obj.postfix, set: (obj, value) => { obj.postfix = value; } }, metadata: _metadata }, _postfix_initializers, _postfix_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .tooltip-with-shortcut {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 10px;
    }
    .tooltip__shortcuts {
      display: flex;
      gap: 2px;
    }
    .tooltip__shortcut {
      font-size: 12px;
      position: relative;

      display: flex;
      align-items: center;
      justify-content: center;
      height: 16px;
      min-width: 16px;
    }
    .tooltip__shortcut::before {
      content: '';
      border-radius: 4px;
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0.2;
    }
    .tooltip__label {
      display: flex;
      flex: 1;
      white-space: pre;
    }
  `; }
        get shortcuts() {
            let shortcut = this.shortcut;
            if (!shortcut)
                return [];
            return shortcut.split(' ');
        }
        render() {
            const { tip, shortcuts, postfix } = this;
            return html `
      <div class="tooltip-with-shortcut">
        <span class="tooltip__label">${tip}</span>
        <div class="tooltip__shortcuts">
          ${repeat(shortcuts, shortcut => html `<span class="tooltip__shortcut">${shortcut}</span>`)}
        </div>
        ${postfix ? html `<span class="tooltip__postfix">${postfix}</span>` : ''}
      </div>
    `;
        }
        #tip_accessor_storage = __runInitializers(this, _tip_initializers, void 0);
        get tip() { return this.#tip_accessor_storage; }
        set tip(value) { this.#tip_accessor_storage = value; }
        #shortcut_accessor_storage = (__runInitializers(this, _tip_extraInitializers), __runInitializers(this, _shortcut_initializers, undefined));
        get shortcut() { return this.#shortcut_accessor_storage; }
        set shortcut(value) { this.#shortcut_accessor_storage = value; }
        #postfix_accessor_storage = (__runInitializers(this, _shortcut_extraInitializers), __runInitializers(this, _postfix_initializers, undefined));
        get postfix() { return this.#postfix_accessor_storage; }
        set postfix(value) { this.#postfix_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _postfix_extraInitializers);
        }
    };
})();
export { TooltipContentWithShortcut };
export function effects() {
    customElements.define('affine-tooltip-content-with-shortcut', TooltipContentWithShortcut);
}
