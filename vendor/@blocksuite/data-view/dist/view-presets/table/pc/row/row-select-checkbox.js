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
import { CheckBoxCheckSolidIcon, CheckBoxUnIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { TableViewRowSelection } from '../../selection';
let RowSelectCheckbox = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _groupKey_decorators;
    let _groupKey_initializers = [];
    let _groupKey_extraInitializers = [];
    let _rowId_decorators;
    let _rowId_initializers = [];
    let _rowId_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class RowSelectCheckbox extends _classSuper {
        constructor() {
            super(...arguments);
            this.#groupKey_accessor_storage = __runInitializers(this, _groupKey_initializers, void 0);
            this.#rowId_accessor_storage = (__runInitializers(this, _groupKey_extraInitializers), __runInitializers(this, _rowId_initializers, void 0));
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _rowId_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            this.isSelected$ = (__runInitializers(this, _tableViewLogic_extraInitializers), computed(() => {
                const selection = this.tableViewLogic.selection$.value;
                if (!selection || selection.selectionType !== 'row') {
                    return false;
                }
                return TableViewRowSelection.includes(selection, {
                    id: this.rowId,
                    groupKey: this.groupKey,
                });
            }));
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _groupKey_decorators = [property({ attribute: false })];
            _rowId_decorators = [property({ attribute: false })];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _groupKey_decorators, { kind: "accessor", name: "groupKey", static: false, private: false, access: { has: obj => "groupKey" in obj, get: obj => obj.groupKey, set: (obj, value) => { obj.groupKey = value; } }, metadata: _metadata }, _groupKey_initializers, _groupKey_extraInitializers);
            __esDecorate(this, null, _rowId_decorators, { kind: "accessor", name: "rowId", static: false, private: false, access: { has: obj => "rowId" in obj, get: obj => obj.rowId, set: (obj, value) => { obj.rowId = value; } }, metadata: _metadata }, _rowId_initializers, _rowId_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    row-select-checkbox {
      display: contents;
    }
    .row-select-checkbox {
      display: flex;
      align-items: center;
      background-color: var(--affine-background-primary-color);
      opacity: 0;
      cursor: pointer;
      font-size: 20px;
      color: var(--affine-icon-color);
    }
    .row-select-checkbox:hover {
      opacity: 1;
    }
    .row-select-checkbox.selected {
      opacity: 1;
    }
  `; }
        #groupKey_accessor_storage;
        get groupKey() { return this.#groupKey_accessor_storage; }
        set groupKey(value) { this.#groupKey_accessor_storage = value; }
        #rowId_accessor_storage;
        get rowId() { return this.#rowId_accessor_storage; }
        set rowId(value) { this.#rowId_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.addFromEvent(this, 'click', () => {
                this.tableViewLogic.selectionController.toggleRow(this.rowId, this.groupKey);
            });
        }
        render() {
            const classString = classMap({
                'row-selected-bg': true,
                'row-select-checkbox': true,
                selected: this.isSelected$.value,
            });
            return html `
      <div class="${classString}">
        ${this.isSelected$.value
                ? CheckBoxCheckSolidIcon({ style: `color:#1E96EB` })
                : CheckBoxUnIcon()}
      </div>
    `;
        }
    };
})();
export { RowSelectCheckbox };
