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
import { menu, popMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { DeleteIcon, DuplicateIcon, FilterIcon, InsertLeftIcon, InsertRightIcon, MoveLeftIcon, MoveRightIcon, SortIcon, ViewIcon, } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';
import { inputConfig, typeConfig, } from '../../../../core/common/property-menu.js';
import { filterTraitKey } from '../../../../core/filter/trait.js';
import { firstFilterByRef } from '../../../../core/filter/utils.js';
import { renderUniLit } from '../../../../core/index.js';
import { sortTraitKey } from '../../../../core/sort/manager.js';
import { createSortUtils } from '../../../../core/sort/utils.js';
import { draggable, dragHandler, droppable, } from '../../../../core/utils/wc-dnd/dnd-context.js';
import { numberFormats } from '../../../../property-presets/number/utils/formats.js';
import { createDefaultShowQuickSettingBar, ShowQuickSettingBarKey, } from '../../../../widget-presets/quick-setting-bar/context.js';
import { DEFAULT_COLUMN_TITLE_HEIGHT } from '../../consts.js';
import { getTableGroupRect, getVerticalIndicator, startDragWidthAdjustmentBar, } from './vertical-indicator.js';
let DatabaseHeaderColumn = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _column_decorators;
    let _column_initializers = [];
    let _column_extraInitializers = [];
    let _grabStatus_decorators;
    let _grabStatus_initializers = [];
    let _grabStatus_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class DatabaseHeaderColumn extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _column_decorators = [property({ attribute: false })];
            _grabStatus_decorators = [property({ attribute: false })];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _column_decorators, { kind: "accessor", name: "column", static: false, private: false, access: { has: obj => "column" in obj, get: obj => obj.column, set: (obj, value) => { obj.column = value; } }, metadata: _metadata }, _column_initializers, _column_extraInitializers);
            __esDecorate(this, null, _grabStatus_decorators, { kind: "accessor", name: "grabStatus", static: false, private: false, access: { has: obj => "grabStatus" in obj, get: obj => obj.grabStatus, set: (obj, value) => { obj.grabStatus = value; } }, metadata: _metadata }, _grabStatus_initializers, _grabStatus_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    affine-database-header-column {
      display: flex;
    }

    .affine-database-header-column-grabbing * {
      cursor: grabbing;
    }
  `; }
        get readonly() {
            return this.tableViewManager.readonly$.value;
        }
        _addFilter() {
            const filterTrait = this.tableViewManager.traitGet(filterTraitKey);
            if (!filterTrait)
                return;
            const filter = firstFilterByRef(this.tableViewManager.vars$.value, {
                type: 'ref',
                name: this.column.id,
            });
            filterTrait.filterSet({
                type: 'group',
                op: 'and',
                conditions: [filter, ...filterTrait.filter$.value.conditions],
            });
            this._toggleQuickSettingBar();
        }
        _addSort(desc) {
            const sortTrait = this.tableViewManager.traitGet(sortTraitKey);
            if (!sortTrait)
                return;
            const sortUtils = createSortUtils(sortTrait, this.tableViewLogic.eventTrace);
            const sortList = sortUtils.sortList$.value;
            const existingIndex = sortList.findIndex(sort => sort.ref.name === this.column.id);
            if (existingIndex !== -1) {
                sortUtils.change(existingIndex, {
                    ref: { type: 'ref', name: this.column.id },
                    desc,
                });
            }
            else {
                sortUtils.add({
                    ref: { type: 'ref', name: this.column.id },
                    desc,
                });
            }
            this._toggleQuickSettingBar();
        }
        _toggleQuickSettingBar(show = true) {
            const map = this.tableViewManager.serviceGetOrCreate(ShowQuickSettingBarKey, createDefaultShowQuickSettingBar);
            map.value = {
                ...map.value,
                [this.tableViewManager.id]: show,
            };
        }
        popMenu(ele) {
            popMenu(popupTargetFromElement(ele ?? this), {
                options: {
                    items: [
                        inputConfig(this.column),
                        typeConfig(this.column),
                        // Number format begin
                        menu.subMenu({
                            name: 'Number Format',
                            hide: () => !this.column.dataUpdate || this.column.type$.value !== 'number',
                            options: {
                                items: [
                                    numberFormatConfig(this.column),
                                    ...numberFormats.map(format => {
                                        const data = this.column.data$.value;
                                        return menu.action({
                                            isSelected: data.format === format.type,
                                            prefix: html `<span
                      style="font-size: var(--affine-font-base); scale: 1.2;"
                      >${format.symbol}</span
                    >`,
                                            name: format.label,
                                            select: () => {
                                                if (data.format === format.type)
                                                    return;
                                                this.column.dataUpdate(() => ({
                                                    format: format.type,
                                                }));
                                            },
                                        });
                                    }),
                                ],
                            },
                        }),
                        // Number format end
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Hide In View',
                                    prefix: ViewIcon(),
                                    hide: () => !this.column.hideCanSet,
                                    select: () => {
                                        this.column.hideSet(true);
                                    },
                                }),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Filter',
                                    prefix: FilterIcon(),
                                    select: () => this._addFilter(),
                                }),
                                menu.action({
                                    name: 'Sort Ascending',
                                    prefix: SortIcon(),
                                    select: () => this._addSort(false),
                                }),
                                menu.action({
                                    name: 'Sort Descending',
                                    prefix: SortIcon(),
                                    select: () => this._addSort(true),
                                }),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Insert Left Column',
                                    prefix: InsertLeftIcon(),
                                    select: () => {
                                        this.tableViewManager.propertyAdd({
                                            id: this.column.id,
                                            before: true,
                                        });
                                        Promise.resolve()
                                            .then(() => {
                                            const pre = this.previousElementSibling?.previousElementSibling;
                                            if (pre instanceof DatabaseHeaderColumn) {
                                                pre.editTitle();
                                                pre.scrollIntoView({
                                                    inline: 'nearest',
                                                    block: 'nearest',
                                                });
                                            }
                                        })
                                            .catch(console.error);
                                    },
                                }),
                                menu.action({
                                    name: 'Insert Right Column',
                                    prefix: InsertRightIcon(),
                                    select: () => {
                                        this.tableViewManager.propertyAdd({
                                            id: this.column.id,
                                            before: false,
                                        });
                                        Promise.resolve()
                                            .then(() => {
                                            const next = this.nextElementSibling?.nextElementSibling;
                                            if (next instanceof DatabaseHeaderColumn) {
                                                next.editTitle();
                                                next.scrollIntoView({
                                                    inline: 'nearest',
                                                    block: 'nearest',
                                                });
                                            }
                                        })
                                            .catch(console.error);
                                    },
                                }),
                                menu.action({
                                    name: 'Move Left',
                                    prefix: MoveLeftIcon(),
                                    hide: () => this.column.isFirst$.value,
                                    select: () => {
                                        const prev = this.column.prev$.value;
                                        if (!prev) {
                                            return;
                                        }
                                        this.column.move({
                                            id: prev.id,
                                            before: true,
                                        });
                                    },
                                }),
                                menu.action({
                                    name: 'Move Right',
                                    prefix: MoveRightIcon(),
                                    hide: () => this.column.isLast$.value,
                                    select: () => {
                                        const next = this.column.next$.value;
                                        if (!next) {
                                            return;
                                        }
                                        this.column.move({
                                            id: next.id,
                                            before: false,
                                        });
                                    },
                                }),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Duplicate',
                                    prefix: DuplicateIcon(),
                                    hide: () => !this.column.canDuplicate,
                                    select: () => {
                                        this.column.duplicate?.();
                                    },
                                }),
                                menu.action({
                                    name: 'Delete',
                                    prefix: DeleteIcon(),
                                    hide: () => !this.column.canDelete,
                                    select: () => {
                                        this.column.delete?.();
                                    },
                                    class: {
                                        'delete-item': true,
                                    },
                                }),
                            ],
                        }),
                    ],
                },
            });
        }
        widthDragStart(event) {
            startDragWidthAdjustmentBar(event, this, this.getBoundingClientRect().width, this.column);
        }
        connectedCallback() {
            super.connectedCallback();
            const table = this.closest('dv-table-view-ui');
            if (table) {
                this.disposables.add(table.logic.handleEvent('dragStart', context => {
                    if (this.tableViewManager.readonly$.value) {
                        return;
                    }
                    const event = context.get('pointerState').raw;
                    const target = event.target;
                    if (target instanceof Element &&
                        this.widthDragBar.value?.contains(target)) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.widthDragStart(event);
                        return true;
                    }
                    return false;
                }));
            }
        }
        render() {
            const column = this.column;
            const style = styleMap({
                height: DEFAULT_COLUMN_TITLE_HEIGHT + 'px',
            });
            const classes = classMap({
                'affine-database-column-move': true,
                [this.grabStatus]: true,
            });
            return html `
      <div
        style=${style}
        class="affine-database-column-content"
        @click="${this._clickColumn}"
        @contextmenu="${this._contextMenu}"
        ${dragHandler(column.id)}
        ${draggable(column.id)}
        ${droppable(column.id)}
      >
        ${this.readonly
                ? null
                : html ` <button class="${classes}">
              <div class="hover-trigger"></div>
              <div class="control-h"></div>
              <div class="control-l"></div>
              <div class="control-r"></div>
            </button>`}
        <div class="affine-database-column-text ${column.type$.value}">
          <div
            class="affine-database-column-type-icon dv-hover"
            @click="${this._clickTypeIcon}"
          >
            <uni-lit .uni="${column.icon}"></uni-lit>
          </div>
          <div class="affine-database-column-text-content">
            <div class="affine-database-column-text-input">
              ${column.name$.value}
            </div>
          </div>
        </div>
      </div>
      <div
        ${ref(this.widthDragBar)}
        @mouseenter="${this._enterWidthDragBar}"
        @mouseleave="${this._leaveWidthDragBar}"
        style="width: 0;position: relative;height: 100%;z-index: 1;cursor: col-resize"
      >
        <div style="width: 8px;height: 100%;margin-left: -4px;"></div>
      </div>
    `;
        }
        #column_accessor_storage;
        get column() { return this.#column_accessor_storage; }
        set column(value) { this.#column_accessor_storage = value; }
        #grabStatus_accessor_storage;
        get grabStatus() { return this.#grabStatus_accessor_storage; }
        set grabStatus(value) { this.#grabStatus_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        get tableViewManager() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this._clickColumn = () => {
                if (this.tableViewManager.readonly$.value) {
                    return;
                }
                this.popMenu();
            };
            this._clickTypeIcon = (event) => {
                if (this.tableViewManager.readonly$.value) {
                    return;
                }
                if (this.column.type$.value === 'title') {
                    return;
                }
                event.stopPropagation();
                popMenu(popupTargetFromElement(this), {
                    options: {
                        items: this.tableViewManager.propertyMetas$.value.map(config => {
                            return menu.action({
                                name: config.config.name,
                                isSelected: config.type === this.column.type$.value,
                                prefix: renderUniLit(config.renderer.icon),
                                select: () => {
                                    this.column.typeSet?.(config.type);
                                },
                            });
                        }),
                    },
                });
            };
            this._contextMenu = (e) => {
                if (this.tableViewManager.readonly$.value) {
                    return;
                }
                e.preventDefault();
                this.popMenu(e.currentTarget);
            };
            this._enterWidthDragBar = () => {
                if (this.tableViewManager.readonly$.value) {
                    return;
                }
                if (this.drawWidthDragBarTask) {
                    cancelAnimationFrame(this.drawWidthDragBarTask);
                    this.drawWidthDragBarTask = 0;
                }
                this.drawWidthDragBar();
            };
            this._leaveWidthDragBar = () => {
                cancelAnimationFrame(this.drawWidthDragBarTask);
                this.drawWidthDragBarTask = 0;
                getVerticalIndicator().remove();
            };
            this.drawWidthDragBar = () => {
                const rect = getTableGroupRect(this);
                if (!rect) {
                    return;
                }
                getVerticalIndicator().display(this.getBoundingClientRect().right, rect.top, rect.bottom - rect.top);
                this.drawWidthDragBarTask = requestAnimationFrame(this.drawWidthDragBar);
            };
            this.drawWidthDragBarTask = 0;
            this.widthDragBar = createRef();
            this.editTitle = () => {
                this._clickColumn();
            };
            this.#column_accessor_storage = __runInitializers(this, _column_initializers, void 0);
            this.#grabStatus_accessor_storage = (__runInitializers(this, _column_extraInitializers), __runInitializers(this, _grabStatus_initializers, 'grabEnd'));
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _grabStatus_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { DatabaseHeaderColumn };
function numberFormatConfig(column) {
    return () => html ` <affine-database-number-format-bar
      .column="${column}"
    ></affine-database-number-format-bar>`;
}
