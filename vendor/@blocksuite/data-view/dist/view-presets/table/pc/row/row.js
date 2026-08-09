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
import { CenterPeekIcon, MoreHorizontalIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';
import { TableViewRowSelection, } from '../../selection';
import { cellDivider } from '../../styles';
import { openDetail, popRowMenu } from '../menu.js';
let TableRowView = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    let _rowId_decorators;
    let _rowId_initializers = [];
    let _rowId_extraInitializers = [];
    let _rowIndex_decorators;
    let _rowIndex_initializers = [];
    let _rowIndex_extraInitializers = [];
    return class TableRowView extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _tableViewLogic_decorators = [property({ attribute: false })];
            _rowId_decorators = [property({ attribute: false })];
            _rowIndex_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            __esDecorate(this, null, _rowId_decorators, { kind: "accessor", name: "rowId", static: false, private: false, access: { has: obj => "rowId" in obj, get: obj => obj.rowId, set: (obj, value) => { obj.rowId = value; } }, metadata: _metadata }, _rowId_initializers, _rowId_extraInitializers);
            __esDecorate(this, null, _rowIndex_decorators, { kind: "accessor", name: "rowIndex", static: false, private: false, access: { has: obj => "rowIndex" in obj, get: obj => obj.rowIndex, set: (obj, value) => { obj.rowIndex = value; } }, metadata: _metadata }, _rowIndex_initializers, _rowIndex_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .affine-database-block-row:has(.row-select-checkbox.selected) {
      background: var(--affine-primary-color-04);
    }
    .affine-database-block-row:has(.row-select-checkbox.selected)
      .row-selected-bg {
      position: relative;
    }
    .affine-database-block-row:has(.row-select-checkbox.selected)
      .row-selected-bg:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: var(--affine-primary-color-04);
    }
    .affine-database-block-row {
      width: 100%;
      display: flex;
      flex-direction: row;
      border-bottom: 1px solid ${unsafeCSS(cssVarV2.layer.insideBorder.border)};
      position: relative;
    }

    .affine-database-block-row.selected > .database-cell {
      background: transparent;
    }

    .row-ops {
      position: relative;
      width: 0;
      margin-top: 4px;
      height: max-content;
      visibility: hidden;
      display: flex;
      gap: 4px;
      cursor: pointer;
      justify-content: end;
    }

    .row-op:last-child {
      margin-right: 8px;
    }

    .affine-database-block-row .show-on-hover-row {
      visibility: hidden;
      opacity: 0;
    }
    .affine-database-block-row:hover .show-on-hover-row {
      visibility: visible;
      opacity: 1;
    }
    .affine-database-block-row:has(.active) .show-on-hover-row {
      visibility: visible;
      opacity: 1;
    }
    .affine-database-block-row:has([data-editing='true']) .show-on-hover-row {
      visibility: hidden;
      opacity: 0;
    }

    .row-op {
      display: flex;
      padding: 4px;
      border-radius: 4px;
      box-shadow: var(--affine-button-shadow);
      background-color: var(--affine-background-primary-color);
      position: relative;
    }

    .row-op:hover:before {
      content: '';
      border-radius: 4px;
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background-color: var(--affine-hover-color);
    }

    .row-op svg {
      fill: var(--affine-icon-color);
      color: var(--affine-icon-color);
      width: 16px;
      height: 16px;
    }
    .data-view-table-view-drag-handler {
      width: 4px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      background-color: var(--affine-background-primary-color);
    }
  `; }
        get groupKey() {
            return this.closest('affine-data-view-table-group')?.group?.key;
        }
        get selectionController() {
            return this.tableViewLogic.selectionController;
        }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.addFromEvent(this, 'contextmenu', this.contextMenu);
            this.classList.add('affine-database-block-row', 'database-row');
        }
        render() {
            const view = this.view;
            return html `
      ${view.readonly$.value
                ? nothing
                : html `<div class="data-view-table-left-bar" style="height: 34px">
            <div style="display: flex;">
              <div
                class="data-view-table-view-drag-handler show-on-hover-row row-selected-bg"
                @click=${this._clickDragHandler}
              >
                <div
                  style="width: 4px;
                  border-radius: 2px;
                  height: 12px;
                  background-color: var(--affine-placeholder-color);"
                ></div>
              </div>
              <row-select-checkbox
                .tableViewLogic="${this.tableViewLogic}"
                .rowId="${this.rowId}"
                .groupKey="${this.groupKey}"
              ></row-select-checkbox>
            </div>
          </div>`}
      ${repeat(view.properties$.value, v => v.id, (column, i) => {
                const clickDetail = () => {
                    if (!this.selectionController) {
                        return;
                    }
                    this.setSelection(TableViewRowSelection.create({
                        rows: [{ id: this.rowId, groupKey: this.groupKey }],
                    }));
                    openDetail(this.tableViewLogic, this.rowId, this.selectionController);
                };
                const openMenu = (e) => {
                    if (!this.selectionController) {
                        return;
                    }
                    const ele = e.currentTarget;
                    const selection = this.selectionController.selection;
                    if (!TableViewRowSelection.is(selection) ||
                        !selection.rows.some(row => row.id === this.rowId && row.groupKey === this.groupKey)) {
                        const row = { id: this.rowId, groupKey: this.groupKey };
                        this.setSelection(TableViewRowSelection.create({
                            rows: [row],
                        }));
                    }
                    popRowMenu(this.tableViewLogic, popupTargetFromElement(ele), this.selectionController);
                };
                return html `
            <div style="display: flex;">
              <dv-table-view-cell-container
                class="database-cell"
                style=${styleMap({
                    width: `${column.width$.value}px`,
                    border: i === 0 ? 'none' : undefined,
                })}
                .tableViewLogic="${this.tableViewLogic}"
                .column="${column}"
                .rowId="${this.rowId}"
                data-row-id="${this.rowId}"
                .rowIndex="${this.rowIndex}"
                data-row-index="${this.rowIndex}"
                .columnId="${column.id}"
                data-column-id="${column.id}"
                .columnIndex="${i}"
                data-column-index="${i}"
              >
              </dv-table-view-cell-container>
              <div class="${cellDivider}"></div>
            </div>
            ${!column.readonly$.value &&
                    column.view.mainProperties$.value.titleColumn === column.id
                    ? html `<div class="row-ops show-on-hover-row">
                  <div class="row-op" @click="${clickDetail}">
                    ${CenterPeekIcon()}
                  </div>
                  ${!view.readonly$.value
                        ? html `<div class="row-op" @click="${openMenu}">
                        ${MoreHorizontalIcon()}
                      </div>`
                        : nothing}
                </div>`
                    : nothing}
          `;
            })}
      <div class="database-cell add-column-button"></div>
    `;
        }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        #rowId_accessor_storage;
        get rowId() { return this.#rowId_accessor_storage; }
        set rowId(value) { this.#rowId_accessor_storage = value; }
        #rowIndex_accessor_storage;
        get rowIndex() { return this.#rowIndex_accessor_storage; }
        set rowIndex(value) { this.#rowIndex_accessor_storage = value; }
        get view() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this._clickDragHandler = () => {
                if (this.view.readonly$.value) {
                    return;
                }
                this.selectionController?.toggleRow(this.rowId, this.groupKey);
            };
            this.contextMenu = (e) => {
                if (this.view.readonly$.value) {
                    return;
                }
                const selection = this.selectionController;
                if (!selection) {
                    return;
                }
                e.preventDefault();
                const ele = e.target;
                const cell = ele.closest('dv-table-view-cell-container');
                const row = { id: this.rowId, groupKey: this.groupKey };
                if (!TableViewRowSelection.includes(selection.selection, row)) {
                    selection.selection = TableViewRowSelection.create({
                        rows: [row],
                    });
                }
                const target = cell ??
                    e.target.closest('.database-cell') ?? // for last add btn cell
                    e.target;
                popRowMenu(this.tableViewLogic, popupTargetFromElement(target), selection);
            };
            this.setSelection = (selection) => {
                if (this.selectionController) {
                    this.selectionController.selection = selection;
                }
            };
            this.#tableViewLogic_accessor_storage = __runInitializers(this, _tableViewLogic_initializers, void 0);
            this.#rowId_accessor_storage = (__runInitializers(this, _tableViewLogic_extraInitializers), __runInitializers(this, _rowId_initializers, void 0));
            this.#rowIndex_accessor_storage = (__runInitializers(this, _rowId_extraInitializers), __runInitializers(this, _rowIndex_initializers, void 0));
            __runInitializers(this, _rowIndex_extraInitializers);
        }
    };
})();
export { TableRowView };
