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
import { popupTargetFromElement } from '@blocksuite/affine-components/context-menu';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed, effect, signal } from '@preact/signals-core';
import { css } from 'lit';
import { property } from 'lit/decorators.js';
import { renderUniLit } from '../../../../core';
import { TableViewAreaSelection, TableViewRowSelection, } from '../../selection';
import { popRowMenu } from './menu';
import { rowSelectedBg } from './row-header-css';
let DatabaseCellContainer = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _gridCell_decorators;
    let _gridCell_initializers = [];
    let _gridCell_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class DatabaseCellContainer extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _gridCell_decorators = [property({ attribute: false })];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _gridCell_decorators, { kind: "accessor", name: "gridCell", static: false, private: false, access: { has: obj => "gridCell" in obj, get: obj => obj.gridCell, set: (obj, value) => { obj.gridCell = value; } }, metadata: _metadata }, _gridCell_initializers, _gridCell_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    affine-database-virtual-cell-container {
      display: flex;
      align-items: start;
      width: 100%;
      border: none;
      outline: none;
      box-sizing: content-box;
    }

    affine-database-virtual-cell-container * {
      box-sizing: border-box;
    }

    affine-database-virtual-cell-container uni-lit > *:first-child {
      padding: 6px;
    }
  `; }
        get cell() {
            return this._cell.value;
        }
        get selectionView() {
            return this.tableViewLogic.selectionController;
        }
        get rowSelected$() {
            return this.gridCell.row.data.selected$;
        }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.addFromEvent(this, 'contextmenu', this.contextMenu);
            this.disposables.addFromEvent(this.parentElement, 'click', () => {
                if (!this.isEditing$.value) {
                    this.selectCurrentCell(!this.column$.value?.readonly$.value);
                }
            });
            this.disposables.addFromEvent(this.parentElement, 'mouseenter', () => {
                this.gridCell.data.hover$.value = true;
            });
            this.disposables.addFromEvent(this.parentElement, 'mouseleave', () => {
                this.gridCell.data.hover$.value = false;
            });
            this.disposables.add(effect(() => {
                const rowSelected = this.rowSelected$.value;
                if (rowSelected) {
                    this.parentElement?.classList.add(rowSelectedBg);
                }
                else {
                    this.parentElement?.classList.remove(rowSelectedBg);
                }
            }));
            const style = this.parentElement?.style;
            if (style) {
                style.borderBottom = '1px solid var(--affine-border-color)';
                style.borderRight = '1px solid var(--affine-border-color)';
            }
        }
        isSelected(selection) {
            if (selection.selectionType !== 'area') {
                return false;
            }
            if (selection.groupKey !== this.groupKey) {
                return false;
            }
            if (selection.focus.columnIndex !== this.columnIndex$.value) {
                return false;
            }
            return selection.focus.rowIndex === this.rowIndex$.value;
        }
        render() {
            const renderer = this.column$.value?.renderer$.value;
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
        setTagDraft(value) {
            this._tagDraft = value;
        }
        consumeTagDraft() {
            const value = this._tagDraft;
            this._tagDraft = undefined;
            return value;
        }
        get rowId() {
            return this.gridCell.row.rowId;
        }
        get columnId() {
            return this.gridCell.columnId;
        }
        get groupKey() {
            return this.gridCell.row.group.groupId;
        }
        #gridCell_accessor_storage;
        get gridCell() { return this.#gridCell_accessor_storage; }
        set gridCell(value) { this.#gridCell_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        get view() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this._cell = signal();
            this.cell$ = computed(() => {
                return this.view.cellGetOrCreate(this.rowId, this.columnId);
            });
            this.selectCurrentCell = (editing) => {
                if (this.view.readonly$.value) {
                    return;
                }
                const selectionView = this.selectionView;
                if (selectionView) {
                    const selection = selectionView.selection;
                    const shouldEnterEditMode = editing && this.cell?.beforeEnterEditMode() !== false;
                    if (selection && this.isSelected(selection) && shouldEnterEditMode) {
                        selectionView.selection = TableViewAreaSelection.create({
                            groupKey: this.groupKey,
                            focus: {
                                rowIndex: this.rowIndex$.value,
                                columnIndex: this.columnIndex$.value,
                            },
                            isEditing: true,
                        });
                    }
                    else {
                        selectionView.selection = TableViewAreaSelection.create({
                            groupKey: this.groupKey,
                            focus: {
                                rowIndex: this.rowIndex$.value,
                                columnIndex: this.columnIndex$.value,
                            },
                            isEditing: false,
                        });
                    }
                }
            };
            this.contextMenu = (e) => {
                if (this.view.readonly$.value) {
                    return;
                }
                const selection = this.selectionView;
                if (!selection) {
                    return;
                }
                e.preventDefault();
                const row = { id: this.rowId, groupKey: this.groupKey };
                if (!TableViewRowSelection.includes(selection.selection, row)) {
                    selection.selection = TableViewRowSelection.create({
                        rows: [row],
                    });
                }
                popRowMenu(this.tableViewLogic, popupTargetFromElement(this), selection);
            };
            this.isRowSelected$ = computed(() => {
                const selection = this.selectionView?.selection;
                if (selection?.selectionType !== 'row') {
                    return false;
                }
                return selection.rows.some(row => row.id === this.rowId);
            });
            this.isEditing$ = signal(false);
            this.rowIndex$ = computed(() => {
                return this.gridCell.rowIndex$.value;
            });
            this.columnIndex$ = computed(() => {
                return this.gridCell.columnIndex$.value - 1;
            });
            this.column$ = computed(() => {
                return this.view.properties$.value.find(property => property.id === this.columnId);
            });
            this.#gridCell_accessor_storage = __runInitializers(this, _gridCell_initializers, void 0);
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _gridCell_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { DatabaseCellContainer };
