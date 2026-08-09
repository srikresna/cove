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
import { PlusIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { autoPlacement, autoUpdate, computePosition, offset, shift, } from '@floating-ui/dom';
import { signal } from '@preact/signals-core';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { addColumnButtonStyle, addRowButtonStyle, addRowColumnButtonStyle, cellCountTipsStyle, } from './add-button-css';
import { DefaultColumnWidth, DefaultRowHeight } from './consts';
export const AddButtonComponentName = 'affine-table-add-button';
let AddButton = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _vertical_decorators;
    let _vertical_initializers = [];
    let _vertical_extraInitializers = [];
    let _dataManager_decorators;
    let _dataManager_initializers = [];
    let _dataManager_extraInitializers = [];
    return class AddButton extends _classSuper {
        constructor() {
            super(...arguments);
            this.#vertical_accessor_storage = __runInitializers(this, _vertical_initializers, false);
            this.#dataManager_accessor_storage = (__runInitializers(this, _vertical_extraInitializers), __runInitializers(this, _dataManager_initializers, void 0));
            this.addColumnButtonRef$ = (__runInitializers(this, _dataManager_extraInitializers), signal());
            this.addRowButtonRef$ = signal();
            this.addRowColumnButtonRef$ = signal();
            this.columnDragging$ = signal(false);
            this.rowDragging$ = signal(false);
            this.rowColumnDragging$ = signal(false);
            this.popCellCountTips = (ele) => {
                const tip = document.createElement('div');
                tip.classList.add(cellCountTipsStyle);
                document.body.append(tip);
                const dispose = autoUpdate(ele, tip, () => {
                    computePosition(ele, tip, {
                        middleware: [
                            autoPlacement({ allowedPlacements: ['bottom'] }),
                            offset(4),
                            shift(),
                        ],
                    })
                        .then(({ x, y }) => {
                        tip.style.left = `${x}px`;
                        tip.style.top = `${y}px`;
                    })
                        .catch(e => {
                        console.error(e);
                    });
                });
                return {
                    tip,
                    dispose: () => {
                        dispose();
                        tip.remove();
                    },
                };
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _vertical_decorators = [property({ type: Boolean })];
            _dataManager_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _vertical_decorators, { kind: "accessor", name: "vertical", static: false, private: false, access: { has: obj => "vertical" in obj, get: obj => obj.vertical, set: (obj, value) => { obj.vertical = value; } }, metadata: _metadata }, _vertical_initializers, _vertical_extraInitializers);
            __esDecorate(this, null, _dataManager_decorators, { kind: "accessor", name: "dataManager", static: false, private: false, access: { has: obj => "dataManager" in obj, get: obj => obj.dataManager, set: (obj, value) => { obj.dataManager = value; } }, metadata: _metadata }, _dataManager_initializers, _dataManager_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #vertical_accessor_storage;
        get vertical() { return this.#vertical_accessor_storage; }
        set vertical(value) { this.#vertical_accessor_storage = value; }
        #dataManager_accessor_storage;
        get dataManager() { return this.#dataManager_accessor_storage; }
        set dataManager(value) { this.#dataManager_accessor_storage = value; }
        get hoverColumnIndex$() {
            return this.dataManager.hoverColumnIndex$;
        }
        get hoverRowIndex$() {
            return this.dataManager.hoverRowIndex$;
        }
        get columns$() {
            return this.dataManager.columns$;
        }
        get rows$() {
            return this.dataManager.rows$;
        }
        getEmptyRows() {
            const rows = this.rows$.value;
            const columns = this.columns$.value;
            const rowWidths = [];
            for (let i = rows.length - 1; i >= 0; i--) {
                const row = rows[i];
                if (!row) {
                    break;
                }
                const hasText = columns.some(column => {
                    const cell = this.dataManager.getCell(row.rowId, column.columnId);
                    if (!cell) {
                        return false;
                    }
                    return cell.text.length > 0;
                });
                if (hasText) {
                    break;
                }
                rowWidths.push((rowWidths[rowWidths.length - 1] ?? 0) + DefaultRowHeight);
            }
            return rowWidths;
        }
        getEmptyColumns() {
            const columns = this.columns$.value;
            const rows = this.rows$.value;
            const columnWidths = [];
            for (let i = columns.length - 1; i >= 0; i--) {
                const column = columns[i];
                if (!column) {
                    break;
                }
                const hasText = rows.some(row => {
                    const cell = this.dataManager.getCell(row.rowId, column.columnId);
                    if (!cell) {
                        return false;
                    }
                    return cell.text.length > 0;
                });
                if (hasText) {
                    break;
                }
                columnWidths.push((columnWidths[columnWidths.length - 1] ?? 0) +
                    (column.width ?? DefaultColumnWidth));
            }
            return columnWidths;
        }
        onDragStart(e) {
            e.stopPropagation();
            const initialX = e.clientX;
            const initialY = e.clientY;
            const target = e.target;
            const isColumn = target.closest('.column-add');
            const isRow = target.closest('.row-add');
            const isRowColumn = target.closest('.row-column-add');
            const realTarget = isColumn || isRowColumn || isRow;
            if (!realTarget) {
                return;
            }
            const tipsHandler = this.popCellCountTips(realTarget);
            let emptyRows = [];
            let emptyColumns = [];
            if (isColumn) {
                this.columnDragging$.value = true;
                emptyColumns = this.getEmptyColumns();
            }
            if (isRow) {
                this.rowDragging$.value = true;
                emptyRows = this.getEmptyRows();
            }
            if (isRowColumn) {
                this.rowColumnDragging$.value = true;
                emptyRows = this.getEmptyRows();
                emptyColumns = this.getEmptyColumns();
            }
            const onMouseMove = (e) => {
                const deltaX = e.clientX - initialX;
                const deltaY = e.clientY - initialY;
                const addColumn = isColumn || isRowColumn;
                const addRow = isRow || isRowColumn;
                if (addColumn) {
                    if (deltaX > 0) {
                        this.dataManager.virtualColumnCount$.value = Math.floor((deltaX + 30) / DefaultColumnWidth);
                    }
                    else {
                        let count = 0;
                        while (count < emptyColumns.length) {
                            const emptyColumnWidth = emptyColumns[count];
                            if (!emptyColumnWidth) {
                                continue;
                            }
                            if (-deltaX > emptyColumnWidth) {
                                count++;
                            }
                            else {
                                break;
                            }
                        }
                        this.dataManager.virtualColumnCount$.value = -count;
                    }
                }
                if (addRow) {
                    if (deltaY > 0) {
                        this.dataManager.virtualRowCount$.value = Math.floor(deltaY / DefaultRowHeight);
                    }
                    else {
                        let count = 0;
                        while (count < emptyRows.length) {
                            const emptyRowHeight = emptyRows[count];
                            if (!emptyRowHeight) {
                                continue;
                            }
                            if (-deltaY > emptyRowHeight) {
                                count++;
                            }
                            else {
                                break;
                            }
                        }
                        this.dataManager.virtualRowCount$.value = -count;
                    }
                }
                tipsHandler.tip.textContent = this.dataManager.cellCountTips$.value;
            };
            const onMouseUp = () => {
                this.columnDragging$.value = false;
                this.rowDragging$.value = false;
                this.rowColumnDragging$.value = false;
                const rowCount = this.dataManager.virtualRowCount$.value;
                const columnCount = this.dataManager.virtualColumnCount$.value;
                this.dataManager.virtualColumnCount$.value = 0;
                this.dataManager.virtualRowCount$.value = 0;
                this.dataManager.addNRow(rowCount);
                this.dataManager.addNColumn(columnCount);
                tipsHandler.dispose();
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.addFromEvent(this, 'mousedown', (e) => {
                this.onDragStart(e);
            });
        }
        renderAddColumnButton() {
            const hovered = this.hoverColumnIndex$.value === this.columns$.value.length - 1;
            const dragging = this.columnDragging$.value;
            return html ` <div
      data-testid="add-column-button"
      class="${classMap({
                [addColumnButtonStyle]: true,
                active: dragging,
                'column-add': true,
            })}"
      ${ref(this.addColumnButtonRef$)}
      style=${styleMap({
                opacity: hovered || dragging ? 1 : undefined,
            })}
      @click="${(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dataManager.addColumn(this.columns$.value.length - 1);
            }}"
    >
      ${PlusIcon()}
    </div>`;
        }
        renderAddRowButton() {
            const hovered = this.hoverRowIndex$.value === this.rows$.value.length - 1;
            const dragging = this.rowDragging$.value;
            return html ` <div
      data-testid="add-row-button"
      class="${classMap({
                [addRowButtonStyle]: true,
                active: dragging,
                'row-add': true,
            })}"
      ${ref(this.addRowButtonRef$)}
      style=${styleMap({
                opacity: hovered || dragging ? 1 : undefined,
            })}
      @click="${(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dataManager.addRow(this.rows$.value.length - 1);
            }}"
    >
      ${PlusIcon()}
    </div>`;
        }
        renderAddRowColumnButton() {
            const hovered = this.hoverRowIndex$.value === this.rows$.value.length - 1 &&
                this.hoverColumnIndex$.value === this.columns$.value.length - 1;
            const dragging = this.rowColumnDragging$.value;
            return html ` <div
      class="${classMap({
                [addRowColumnButtonStyle]: true,
                active: dragging,
                'row-column-add': true,
            })}"
      ${ref(this.addRowColumnButtonRef$)}
      style=${styleMap({
                opacity: hovered || dragging ? 1 : undefined,
            })}
      @click="${(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.dataManager.addRow(this.rows$.value.length - 1);
                this.dataManager.addColumn(this.columns$.value.length - 1);
            }}"
    >
      ${PlusIcon()}
    </div>`;
        }
        render() {
            return html `
      ${this.renderAddColumnButton()} ${this.renderAddRowButton()}
      ${this.renderAddRowColumnButton()}
    `;
        }
    };
})();
export { AddButton };
