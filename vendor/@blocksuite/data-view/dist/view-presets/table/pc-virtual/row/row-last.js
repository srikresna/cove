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
import { cssVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { effect } from '@preact/signals-core';
import { property } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import * as styles from './row-header-css.js';
let TableRowLast = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _gridCell_decorators;
    let _gridCell_initializers = [];
    let _gridCell_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class TableRowLast extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _gridCell_decorators = [property({ attribute: false })];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _gridCell_decorators, { kind: "accessor", name: "gridCell", static: false, private: false, access: { has: obj => "gridCell" in obj, get: obj => obj.gridCell, set: (obj, value) => { obj.gridCell = value; } }, metadata: _metadata }, _gridCell_initializers, _gridCell_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get rowSelected$() {
            return this.gridCell.row.data.selected$;
        }
        connectedCallback() {
            super.connectedCallback();
            const style = this.parentElement?.style;
            if (style) {
                style.borderBottom = `1px solid ${cssVarV2.database.border}`;
            }
            this.disposables.add(effect(() => {
                const rowSelected = this.rowSelected$.value;
                if (rowSelected) {
                    this.parentElement?.classList.add(styles.rowSelectedBg);
                }
                else {
                    this.parentElement?.classList.remove(styles.rowSelectedBg);
                }
            }));
            this.disposables.addFromEvent(this.parentElement, 'mouseenter', () => {
                this.gridCell.data.hover$.value = true;
            });
            this.disposables.addFromEvent(this.parentElement, 'mouseleave', () => {
                this.gridCell.data.hover$.value = false;
            });
        }
        render() {
            return html ``;
        }
        get rowId() {
            return this.gridCell.row.rowId;
        }
        get groupKey() {
            return this.gridCell.row.group.groupId;
        }
        #gridCell_accessor_storage = __runInitializers(this, _gridCell_initializers, void 0);
        get gridCell() { return this.#gridCell_accessor_storage; }
        set gridCell(value) { this.#gridCell_accessor_storage = value; }
        #tableViewLogic_accessor_storage = (__runInitializers(this, _gridCell_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { TableRowLast };
