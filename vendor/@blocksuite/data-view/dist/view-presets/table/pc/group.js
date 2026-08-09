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
import { menu, popFilterableSimpleMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PlusIcon, ToggleDownIcon, ToggleRightIcon, } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { effect, signal } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, html, nothing, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { GroupTitle } from '../../../core/group-by/group-title.js';
import { createDndContext } from '../../../core/utils/wc-dnd/dnd-context.js';
import { defaultActivators } from '../../../core/utils/wc-dnd/sensors/index.js';
import { linearMove } from '../../../core/utils/wc-dnd/utils/linear-move.js';
import { getCollapsedState, setCollapsedState } from '../collapsed-state.js';
import { LEFT_TOOL_BAR_WIDTH } from '../consts.js';
import { TableViewAreaSelection } from '../selection';
import { DataViewColumnPreview } from './header/column-renderer.js';
import { getVerticalIndicator } from './header/vertical-indicator.js';
const styles = css `
  affine-data-view-table-group:hover .group-header-op {
    visibility: visible;
    opacity: 1;
  }

  affine-data-view-table-group {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--affine-border-color);
  }

  .data-view-table-group-add-row {
    display: flex;
    width: 100%;
    height: 28px;
    position: relative;
    z-index: 0;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
    padding: 4px 8px;
    border-bottom: 1px solid ${unsafeCSS(cssVarV2.layer.insideBorder.border)};
  }

  .affine-data-view-table-group:hover svg {
    fill: var(--affine-icon-color);
  }

  @media print {
    .data-view-table-group-add-row {
      display: none;
    }
  }

  .data-view-table-group-add-row-button {
    position: sticky;
    left: ${8 + LEFT_TOOL_BAR_WIDTH}px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    user-select: none;
    font-size: 12px;
    line-height: 20px;
    color: var(--affine-text-secondary-color);
  }

  .group-toggle-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 150ms cubic-bezier(0.42, 0, 1, 1);
  }

  .group-toggle-btn:hover {
    background: var(--affine-hover-color);
  }

  .group-toggle-btn svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    user-select: none;
  }
`;
let TableGroup = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _group_decorators;
    let _group_initializers = [];
    let _group_extraInitializers = [];
    let _rowsContainer_decorators;
    let _rowsContainer_initializers = [];
    let _rowsContainer_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class TableGroup extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _group_decorators = [property({ attribute: false })];
            _rowsContainer_decorators = [query('.affine-database-block-rows')];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _group_decorators, { kind: "accessor", name: "group", static: false, private: false, access: { has: obj => "group" in obj, get: obj => obj.group, set: (obj, value) => { obj.group = value; } }, metadata: _metadata }, _group_initializers, _group_extraInitializers);
            __esDecorate(this, null, _rowsContainer_decorators, { kind: "accessor", name: "rowsContainer", static: false, private: false, access: { has: obj => "rowsContainer" in obj, get: obj => obj.rowsContainer, set: (obj, value) => { obj.rowsContainer = value; } }, metadata: _metadata }, _rowsContainer_initializers, _rowsContainer_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        _loadCollapsedState() {
            if (this.storageLoaded)
                return;
            this.storageLoaded = true;
            const view = this.tableViewLogic?.view;
            if (!view)
                return;
            const value = getCollapsedState(view.id, this.group?.key ?? 'all');
            this.collapsed$.value = value;
        }
        #group_accessor_storage;
        get group() { return this.#group_accessor_storage; }
        set group(value) { this.#group_accessor_storage = value; }
        get rows() {
            return this.group?.rows ?? this.view.rows$.value;
        }
        renderRows(rows) {
            return html `
      <affine-database-column-header
        .renderGroupHeader=${this.renderGroupHeader}
        .tableViewLogic=${this.tableViewLogic}
      ></affine-database-column-header>
      <div class="affine-database-block-rows">
        ${repeat(rows, row => row.rowId, (row, idx) => {
                return html ` <data-view-table-row
              data-row-index="${idx}"
              data-row-id="${row.rowId}"
              .tableViewLogic="${this.tableViewLogic}"
              .rowId="${row.rowId}"
              .rowIndex="${idx}"
            ></data-view-table-row>`;
            })}
      </div>
      ${this.view.readonly$.value
                ? null
                : html ` <div
            class="data-view-table-group-add-row dv-hover"
            @click="${this.clickAddRow}"
          >
            <div
              class="data-view-table-group-add-row-button dv-icon-16"
              data-test-id="affine-database-add-row-button"
              role="button"
            >
              ${PlusIcon()}<span style="font-size: 12px">New Record</span>
            </div>
          </div>`}
      <affine-database-column-stats
        .tableViewLogic="${this.tableViewLogic}"
        .group="${this.group}"
      >
      </affine-database-column-stats>
    `;
        }
        willUpdate(changed) {
            super.willUpdate(changed);
            if (!this.storageLoaded &&
                (changed.has('group') || changed.has('tableViewLogic'))) {
                this._loadCollapsedState();
            }
        }
        connectedCallback() {
            super.connectedCallback();
            this._loadCollapsedState();
            this.showIndicator();
        }
        render() {
            return html `
      ${this.collapsed$.value ? this.renderGroupHeader() : nothing}
      ${this.collapsed$.value ? nothing : this.renderRows(this.rows)}
    `;
        }
        #rowsContainer_accessor_storage;
        get rowsContainer() { return this.#rowsContainer_accessor_storage; }
        set rowsContainer(value) { this.#rowsContainer_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        get view() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this.collapsed$ = signal(false);
            this.storageLoaded = false;
            this._toggleCollapse = (e) => {
                e?.stopPropagation();
                const next = !this.collapsed$.value;
                this.collapsed$.value = next;
                const view = this.tableViewLogic?.view;
                if (view) {
                    setCollapsedState(view.id, this.group?.key ?? 'all', next);
                }
            };
            this.clickAddRow = () => {
                this.view.rowAdd('end', this.group?.key);
                const selectionController = this.tableViewLogic.selectionController;
                selectionController.selection = undefined;
                requestAnimationFrame(() => {
                    const index = this.view.properties$.value.findIndex(v => v.type$.value === 'title');
                    selectionController.selection = TableViewAreaSelection.create({
                        groupKey: this.group?.key,
                        focus: {
                            rowIndex: this.rows.length - 1,
                            columnIndex: index,
                        },
                        isEditing: true,
                    });
                    this.requestUpdate();
                });
            };
            this.clickAddRowInStart = () => {
                this.view.rowAdd('start', this.group?.key);
                const selectionController = this.tableViewLogic.selectionController;
                selectionController.selection = undefined;
                requestAnimationFrame(() => {
                    const index = this.view.properties$.value.findIndex(v => v.type$.value === 'title');
                    selectionController.selection = TableViewAreaSelection.create({
                        groupKey: this.group?.key,
                        focus: {
                            rowIndex: 0,
                            columnIndex: index,
                        },
                        isEditing: true,
                    });
                    this.requestUpdate();
                });
            };
            this.clickGroupOptions = (e) => {
                const group = this.group;
                if (!group) {
                    return;
                }
                const ele = e.currentTarget;
                popFilterableSimpleMenu(popupTargetFromElement(ele), [
                    menu.action({
                        name: 'Ungroup',
                        hide: () => group.value == null,
                        select: () => {
                            group.rows.forEach(row => {
                                group.manager.removeFromGroup(row.rowId, group.key);
                            });
                        },
                    }),
                    menu.action({
                        name: 'Delete Cards',
                        select: () => {
                            this.view.rowsDelete(group.rows.map(row => row.rowId));
                            this.requestUpdate();
                        },
                    }),
                ]);
            };
            this.renderGroupHeader = () => {
                if (!this.group) {
                    return null;
                }
                return html `
      <div
        style="position: sticky;left: 0;width: max-content;padding: 6px 0;margin-bottom: 4px;display:flex;align-items:center;gap: 8px;max-width: 400px"
      >
        <div
          class=${`group-toggle-btn ${this.collapsed$.value ? '' : 'expanded'}`}
          role="button"
          aria-expanded=${this.collapsed$.value ? 'false' : 'true'}
          aria-label=${this.collapsed$.value
                    ? 'Expand group'
                    : 'Collapse group'}
          tabindex="0"
          @click=${this._toggleCollapse}
          @keydown=${(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this._toggleCollapse();
                    }
                }}
        >
          ${this.collapsed$.value
                    ? ToggleRightIcon({ width: '16px', height: '16px' })
                    : ToggleDownIcon({ width: '16px', height: '16px' })}
        </div>

        ${GroupTitle(this.group, {
                    readonly: this.view.readonly$.value,
                    clickAdd: this.clickAddRowInStart,
                    clickOps: this.clickGroupOptions,
                })}
      </div>
    `;
            };
            this.#group_accessor_storage = __runInitializers(this, _group_initializers, undefined);
            this.dndContext = (__runInitializers(this, _group_extraInitializers), createDndContext({
                activators: defaultActivators,
                container: this,
                modifiers: [
                    ({ transform }) => {
                        return {
                            ...transform,
                            y: 0,
                        };
                    },
                ],
                onDragEnd: ({ over, active }) => {
                    if (over && over.id !== active.id) {
                        const activeIndex = this.view.properties$.value.findIndex(data => data.id === active.id);
                        const overIndex = this.view.properties$.value.findIndex(data => data.id === over.id);
                        this.view.propertyGetOrCreate(active.id).move({
                            before: activeIndex > overIndex,
                            id: over.id,
                        });
                    }
                },
                collisionDetection: linearMove(true),
                createOverlay: active => {
                    const column = this.view.propertyGetOrCreate(active.id);
                    const preview = new DataViewColumnPreview();
                    preview.column = column;
                    preview.group = this.group;
                    preview.container = this;
                    preview.tableViewLogic = this.tableViewLogic;
                    preview.style.position = 'absolute';
                    preview.style.zIndex = '999';
                    const scale = this.dndContext.scale$.value;
                    const offsetParentRect = this.offsetParent?.getBoundingClientRect();
                    if (!offsetParentRect) {
                        return;
                    }
                    preview.style.width = `${column.width$.value}px`;
                    preview.style.top = `${(active.rect.top - offsetParentRect.top - 1) / scale.y}px`;
                    preview.style.left = `${(active.rect.left - offsetParentRect.left) / scale.x}px`;
                    const cells = Array.from(this.querySelectorAll(`[data-column-id="${active.id}"]`));
                    cells.forEach(ele => {
                        ele.style.opacity = '0.1';
                    });
                    this.append(preview);
                    return {
                        overlay: preview,
                        cleanup: () => {
                            preview.remove();
                            cells.forEach(ele => {
                                ele.style.opacity = '1';
                            });
                        },
                    };
                },
            }));
            this.showIndicator = () => {
                const columnMoveIndicator = getVerticalIndicator();
                this.disposables.add(effect(() => {
                    const active = this.dndContext.active$.value;
                    const over = this.dndContext.over$.value;
                    if (!active || !over) {
                        columnMoveIndicator.remove();
                        return;
                    }
                    const scrollX = this.dndContext.scrollOffset$.value.x;
                    const bottom = this.rowsContainer?.getBoundingClientRect().bottom ??
                        this.getBoundingClientRect().bottom;
                    const left = over.rect.left < active.rect.left ? over.rect.left : over.rect.right;
                    const height = bottom - over.rect.top;
                    columnMoveIndicator.display(left - scrollX, over.rect.top, height);
                }));
            };
            this.#rowsContainer_accessor_storage = __runInitializers(this, _rowsContainer_initializers, null);
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _rowsContainer_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { TableGroup };
