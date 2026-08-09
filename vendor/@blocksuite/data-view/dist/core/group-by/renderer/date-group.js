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
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
let DateGroupView = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _group_decorators;
    let _group_initializers = [];
    let _group_extraInitializers = [];
    return class DateGroupView extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _group_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _group_decorators, { kind: "accessor", name: "group", static: false, private: false, access: { has: obj => "group" in obj, get: obj => obj.group, set: (obj, value) => { obj.group = value; } }, metadata: _metadata }, _group_initializers, _group_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .dv-date-group {
      border-radius: 8px;
      padding: 4px 8px;
      width: max-content;
      cursor: default;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dv-date-group:hover {
      background-color: var(--affine-hover-color);
    }
    .counter {
      flex-shrink: 0;
      min-width: 22px;
      height: 22px;
      border-radius: 4px;
      background: var(--affine-background-secondary-color);
      color: var(--affine-text-secondary-color);
      font-size: var(--data-view-cell-text-size);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `; }
        #group_accessor_storage = __runInitializers(this, _group_initializers, void 0);
        get group() { return this.#group_accessor_storage; }
        set group(value) { this.#group_accessor_storage = value; }
        render() {
            const name = this.group.name$.value;
            // Use contextual name based on the property when value is null
            const displayName = name ||
                (this.group.value === null
                    ? `No ${this.group.property.name$.value}`
                    : 'Ungroups');
            return html `<div class="dv-date-group">
      <span>${displayName}</span>
    </div>`;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _group_extraInitializers);
        }
    };
})();
export { DateGroupView };
customElements.define('data-view-date-group-view', DateGroupView);
