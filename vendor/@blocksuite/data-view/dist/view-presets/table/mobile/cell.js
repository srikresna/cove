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
import { computed, effect, signal } from '@preact/signals-core';
import { css } from 'lit';
import { property } from 'lit/decorators.js';
import { renderUniLit, } from '../../../core/index.js';
import { TableViewAreaSelection } from '../selection';
let MobileTableCell = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _column_decorators;
    let _column_initializers = [];
    let _column_extraInitializers = [];
    let _rowId_decorators;
    let _rowId_initializers = [];
    let _rowId_extraInitializers = [];
    let _columnId_decorators;
    let _columnId_initializers = [];
    let _columnId_extraInitializers = [];
    let _columnIndex_decorators;
    let _columnIndex_initializers = [];
    let _columnIndex_extraInitializers = [];
    let _rowIndex_decorators;
    let _rowIndex_initializers = [];
    let _rowIndex_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class MobileTableCell extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _column_decorators = [property({ attribute: false })];
            _rowId_decorators = [property({ attribute: false })];
            _columnId_decorators = [property({ attribute: false })];
            _columnIndex_decorators = [property({ attribute: false })];
            _rowIndex_decorators = [property({ attribute: false })];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _column_decorators, { kind: "accessor", name: "column", static: false, private: false, access: { has: obj => "column" in obj, get: obj => obj.column, set: (obj, value) => { obj.column = value; } }, metadata: _metadata }, _column_initializers, _column_extraInitializers);
            __esDecorate(this, null, _rowId_decorators, { kind: "accessor", name: "rowId", static: false, private: false, access: { has: obj => "rowId" in obj, get: obj => obj.rowId, set: (obj, value) => { obj.rowId = value; } }, metadata: _metadata }, _rowId_initializers, _rowId_extraInitializers);
            __esDecorate(this, null, _columnId_decorators, { kind: "accessor", name: "columnId", static: false, private: false, access: { has: obj => "columnId" in obj, get: obj => obj.columnId, set: (obj, value) => { obj.columnId = value; } }, metadata: _metadata }, _columnId_initializers, _columnId_extraInitializers);
            __esDecorate(this, null, _columnIndex_decorators, { kind: "accessor", name: "columnIndex", static: false, private: false, access: { has: obj => "columnIndex" in obj, get: obj => obj.columnIndex, set: (obj, value) => { obj.columnIndex = value; } }, metadata: _metadata }, _columnIndex_initializers, _columnIndex_extraInitializers);
            __esDecorate(this, null, _rowIndex_decorators, { kind: "accessor", name: "rowIndex", static: false, private: false, access: { has: obj => "rowIndex" in obj, get: obj => obj.rowIndex, set: (obj, value) => { obj.rowIndex = value; } }, metadata: _metadata }, _rowIndex_initializers, _rowIndex_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    mobile-table-cell {
      display: flex;
      align-items: start;
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
    }

    mobile-table-cell * {
      box-sizing: border-box;
    }

    mobile-table-cell uni-lit > *:first-child {
      padding: 6px;
    }
  `; }
        #column_accessor_storage;
        get column() { return this.#column_accessor_storage; }
        set column(value) { this.#column_accessor_storage = value; }
        #rowId_accessor_storage;
        get rowId() { return this.#rowId_accessor_storage; }
        set rowId(value) { this.#rowId_accessor_storage = value; }
        get cell() {
            return this._cell.value;
        }
        get groupKey() {
            return this.closest('mobile-table-group')?.group?.key;
        }
        connectedCallback() {
            super.connectedCallback();
            if (this.column.readonly$.value)
                return;
            this.disposables.add(effect(() => {
                const isEditing = this.isSelectionEditing$.value;
                if (isEditing && !this.isEditing$.peek()) {
                    this.isEditing$.value = true;
                    const cell = this._cell.value;
                    requestAnimationFrame(() => {
                        cell?.afterEnterEditingMode();
                    });
                }
                else if (!isEditing && this.isEditing$.peek()) {
                    this._cell.value?.beforeExitEditingMode();
                    this.isEditing$.value = false;
                }
            }));
            this.disposables.addFromEvent(this, 'click', () => {
                if (!this.isEditing$.value) {
                    this.selectCurrentCell(!this.column.readonly$.value);
                }
            });
        }
        render() {
            const renderer = this.column.renderer$.value;
            if (!renderer) {
                return;
            }
            const { view } = renderer;
            this.view.lockRows(this.isEditing$.value);
            this.dataset['editing'] = `${this.isEditing$.value}`;
            const props = {
                cell: this.cell$.value,
                isEditing$: this.isEditing$,
                selectCurrentCell: this.selectCurrentCell,
            };
            return renderUniLit(view, props, {
                ref: this._cell,
                style: {
                    display: 'contents',
                },
            });
        }
        #columnId_accessor_storage;
        get columnId() { return this.#columnId_accessor_storage; }
        set columnId(value) { this.#columnId_accessor_storage = value; }
        #columnIndex_accessor_storage;
        get columnIndex() { return this.#columnIndex_accessor_storage; }
        set columnIndex(value) { this.#columnIndex_accessor_storage = value; }
        #rowIndex_accessor_storage;
        get rowIndex() { return this.#rowIndex_accessor_storage; }
        set rowIndex(value) { this.#rowIndex_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        get view() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this._cell = signal();
            this.#column_accessor_storage = __runInitializers(this, _column_initializers, void 0);
            this.#rowId_accessor_storage = (__runInitializers(this, _column_extraInitializers), __runInitializers(this, _rowId_initializers, void 0));
            this.cell$ = (__runInitializers(this, _rowId_extraInitializers), computed(() => {
                return this.column.cellGetOrCreate(this.rowId);
            }));
            this.isSelectionEditing$ = computed(() => {
                const selection = this.tableViewLogic.selection$.value;
                if (selection?.selectionType !== 'area') {
                    return false;
                }
                if (selection.groupKey !== this.groupKey) {
                    return false;
                }
                if (selection.focus.columnIndex !== this.columnIndex) {
                    return false;
                }
                if (selection.focus.rowIndex !== this.rowIndex) {
                    return false;
                }
                return selection.isEditing;
            });
            this.selectCurrentCell = (editing) => {
                if (this.view.readonly$.value) {
                    return;
                }
                const setSelection = this.tableViewLogic.setSelection.bind(this.tableViewLogic);
                const viewId = this.tableViewLogic.view.id;
                if (setSelection && viewId) {
                    if (editing && this.cell?.beforeEnterEditMode() === false) {
                        return;
                    }
                    setSelection({
                        viewId,
                        type: 'table',
                        ...TableViewAreaSelection.create({
                            groupKey: this.groupKey,
                            focus: {
                                rowIndex: this.rowIndex,
                                columnIndex: this.columnIndex,
                            },
                            isEditing: editing,
                        }),
                    });
                }
            };
            this.#columnId_accessor_storage = __runInitializers(this, _columnId_initializers, void 0);
            this.#columnIndex_accessor_storage = (__runInitializers(this, _columnId_extraInitializers), __runInitializers(this, _columnIndex_initializers, void 0));
            this.isEditing$ = (__runInitializers(this, _columnIndex_extraInitializers), signal(false));
            this.#rowIndex_accessor_storage = __runInitializers(this, _rowIndex_initializers, void 0);
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _rowIndex_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { MobileTableCell };
