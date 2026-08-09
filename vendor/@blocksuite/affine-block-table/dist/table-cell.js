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
import { TextBackgroundDuotoneIcon } from '@blocksuite/affine-components/icons';
import { DefaultInlineManagerExtension } from '@blocksuite/affine-inline-preset';
import { RichText } from '@blocksuite/affine-rich-text';
import { cssVarV2 } from '@blocksuite/affine-shared/theme';
import { getViewportElement } from '@blocksuite/affine-shared/utils';
import { IS_MAC } from '@blocksuite/global/env';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ArrowDownBigIcon, ArrowLeftBigIcon, ArrowRightBigIcon, ArrowUpBigIcon, CloseIcon, ColorPickerIcon, CopyIcon, DeleteIcon, DuplicateIcon, InsertAboveIcon, InsertBelowIcon, InsertLeftIcon, InsertRightIcon, PasteIcon, } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed, effect, signal } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { colorList } from './color';
import { ColumnMaxWidth, DefaultColumnWidth } from './consts';
import { TableSelectionData, } from './selection-schema';
import { cellContainerStyle, columnLeftIndicatorStyle, columnOptionsCellStyle, columnOptionsStyle, columnRightIndicatorStyle, rowBottomIndicatorStyle, rowOptionsCellStyle, rowOptionsStyle, rowTopIndicatorStyle, threePointerIconDotStyle, threePointerIconStyle, } from './table-cell-css';
export const TableCellComponentName = 'affine-table-cell';
let TableCell = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _text_decorators;
    let _text_initializers = [];
    let _text_extraInitializers = [];
    let _dataManager_decorators;
    let _dataManager_initializers = [];
    let _dataManager_extraInitializers = [];
    let _richText_decorators;
    let _richText_initializers = [];
    let _richText_extraInitializers = [];
    let _rowIndex_decorators;
    let _rowIndex_initializers = [];
    let _rowIndex_extraInitializers = [];
    let _columnIndex_decorators;
    let _columnIndex_initializers = [];
    let _columnIndex_extraInitializers = [];
    let _row_decorators;
    let _row_initializers = [];
    let _row_extraInitializers = [];
    let _column_decorators;
    let _column_initializers = [];
    let _column_extraInitializers = [];
    let _selectionController_decorators;
    let _selectionController_initializers = [];
    let _selectionController_extraInitializers = [];
    let _height_decorators;
    let _height_initializers = [];
    let _height_extraInitializers = [];
    return class TableCell extends _classSuper {
        constructor() {
            super(...arguments);
            this.#text_accessor_storage = __runInitializers(this, _text_initializers, undefined);
            this.#dataManager_accessor_storage = (__runInitializers(this, _text_extraInitializers), __runInitializers(this, _dataManager_initializers, void 0));
            this.#richText_accessor_storage = (__runInitializers(this, _dataManager_extraInitializers), __runInitializers(this, _richText_initializers, null));
            this.#rowIndex_accessor_storage = (__runInitializers(this, _richText_extraInitializers), __runInitializers(this, _rowIndex_initializers, 0));
            this.#columnIndex_accessor_storage = (__runInitializers(this, _rowIndex_extraInitializers), __runInitializers(this, _columnIndex_initializers, 0));
            this.#row_accessor_storage = (__runInitializers(this, _columnIndex_extraInitializers), __runInitializers(this, _row_initializers, undefined));
            this.#column_accessor_storage = (__runInitializers(this, _row_extraInitializers), __runInitializers(this, _column_initializers, undefined));
            this.#selectionController_accessor_storage = (__runInitializers(this, _column_extraInitializers), __runInitializers(this, _selectionController_initializers, void 0));
            this.#height_accessor_storage = (__runInitializers(this, _selectionController_extraInitializers), __runInitializers(this, _height_initializers, void 0));
            this.virtualWidth$ = (__runInitializers(this, _height_extraInitializers), computed(() => {
                const virtualWidth = this.dataManager.virtualWidth$.value;
                if (!virtualWidth || this.column?.columnId !== virtualWidth.columnId) {
                    return undefined;
                }
                return virtualWidth.width;
            }));
            this.showColumnIndicator$ = computed(() => {
                const indicatorIndex = this.dataManager.ui.columnIndicatorIndex$.value ?? -1;
                if (indicatorIndex === 0 && this.columnIndex === 0) {
                    return 'left';
                }
                if (indicatorIndex - 1 === this.columnIndex) {
                    return 'right';
                }
                return;
            });
            this.showRowIndicator$ = computed(() => {
                const indicatorIndex = this.dataManager.ui.rowIndicatorIndex$.value ?? -1;
                if (indicatorIndex === 0 && this.rowIndex === 0) {
                    return 'top';
                }
                if (indicatorIndex - 1 === this.rowIndex) {
                    return 'bottom';
                }
                return;
            });
            this.richText$ = signal();
            this._handleKeyDown = (e) => {
                if (e.key !== 'Escape' && e.key === 'Tab') {
                    e.preventDefault();
                    return;
                }
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _text_decorators = [property({ attribute: false })];
            _dataManager_decorators = [property({ attribute: false })];
            _richText_decorators = [query('rich-text')];
            _rowIndex_decorators = [property({ type: Number })];
            _columnIndex_decorators = [property({ type: Number })];
            _row_decorators = [property({ attribute: false })];
            _column_decorators = [property({ attribute: false })];
            _selectionController_decorators = [property({ attribute: false })];
            _height_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _text_decorators, { kind: "accessor", name: "text", static: false, private: false, access: { has: obj => "text" in obj, get: obj => obj.text, set: (obj, value) => { obj.text = value; } }, metadata: _metadata }, _text_initializers, _text_extraInitializers);
            __esDecorate(this, null, _dataManager_decorators, { kind: "accessor", name: "dataManager", static: false, private: false, access: { has: obj => "dataManager" in obj, get: obj => obj.dataManager, set: (obj, value) => { obj.dataManager = value; } }, metadata: _metadata }, _dataManager_initializers, _dataManager_extraInitializers);
            __esDecorate(this, null, _richText_decorators, { kind: "accessor", name: "richText", static: false, private: false, access: { has: obj => "richText" in obj, get: obj => obj.richText, set: (obj, value) => { obj.richText = value; } }, metadata: _metadata }, _richText_initializers, _richText_extraInitializers);
            __esDecorate(this, null, _rowIndex_decorators, { kind: "accessor", name: "rowIndex", static: false, private: false, access: { has: obj => "rowIndex" in obj, get: obj => obj.rowIndex, set: (obj, value) => { obj.rowIndex = value; } }, metadata: _metadata }, _rowIndex_initializers, _rowIndex_extraInitializers);
            __esDecorate(this, null, _columnIndex_decorators, { kind: "accessor", name: "columnIndex", static: false, private: false, access: { has: obj => "columnIndex" in obj, get: obj => obj.columnIndex, set: (obj, value) => { obj.columnIndex = value; } }, metadata: _metadata }, _columnIndex_initializers, _columnIndex_extraInitializers);
            __esDecorate(this, null, _row_decorators, { kind: "accessor", name: "row", static: false, private: false, access: { has: obj => "row" in obj, get: obj => obj.row, set: (obj, value) => { obj.row = value; } }, metadata: _metadata }, _row_initializers, _row_extraInitializers);
            __esDecorate(this, null, _column_decorators, { kind: "accessor", name: "column", static: false, private: false, access: { has: obj => "column" in obj, get: obj => obj.column, set: (obj, value) => { obj.column = value; } }, metadata: _metadata }, _column_initializers, _column_extraInitializers);
            __esDecorate(this, null, _selectionController_decorators, { kind: "accessor", name: "selectionController", static: false, private: false, access: { has: obj => "selectionController" in obj, get: obj => obj.selectionController, set: (obj, value) => { obj.selectionController = value; } }, metadata: _metadata }, _selectionController_initializers, _selectionController_extraInitializers);
            __esDecorate(this, null, _height_decorators, { kind: "accessor", name: "height", static: false, private: false, access: { has: obj => "height" in obj, get: obj => obj.height, set: (obj, value) => { obj.height = value; } }, metadata: _metadata }, _height_initializers, _height_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #text_accessor_storage;
        get text() { return this.#text_accessor_storage; }
        set text(value) { this.#text_accessor_storage = value; }
        get readonly() {
            return this.dataManager.readonly$.value;
        }
        #dataManager_accessor_storage;
        get dataManager() { return this.#dataManager_accessor_storage; }
        set dataManager(value) { this.#dataManager_accessor_storage = value; }
        #richText_accessor_storage;
        get richText() { return this.#richText_accessor_storage; }
        set richText(value) { this.#richText_accessor_storage = value; }
        #rowIndex_accessor_storage;
        get rowIndex() { return this.#rowIndex_accessor_storage; }
        set rowIndex(value) { this.#rowIndex_accessor_storage = value; }
        #columnIndex_accessor_storage;
        get columnIndex() { return this.#columnIndex_accessor_storage; }
        set columnIndex(value) { this.#columnIndex_accessor_storage = value; }
        #row_accessor_storage;
        get row() { return this.#row_accessor_storage; }
        set row(value) { this.#row_accessor_storage = value; }
        #column_accessor_storage;
        get column() { return this.#column_accessor_storage; }
        set column(value) { this.#column_accessor_storage = value; }
        #selectionController_accessor_storage;
        get selectionController() { return this.#selectionController_accessor_storage; }
        set selectionController(value) { this.#selectionController_accessor_storage = value; }
        #height_accessor_storage;
        get height() { return this.#height_accessor_storage; }
        set height(value) { this.#height_accessor_storage = value; }
        get hoverColumnIndex$() {
            return this.dataManager.hoverColumnIndex$;
        }
        get hoverRowIndex$() {
            return this.dataManager.hoverRowIndex$;
        }
        get inlineManager() {
            return this.closest('affine-table')?.std.get(DefaultInlineManagerExtension.identifier);
        }
        get topContenteditableElement() {
            return this.closest('affine-table')
                ?.topContenteditableElement;
        }
        openColumnOptions(target, column, columnIndex) {
            this.selectionController.setSelected({
                type: 'column',
                columnId: column.columnId,
            });
            popMenu(target, {
                options: {
                    onClose: () => {
                        this.selectionController.setSelected(undefined);
                    },
                    items: [
                        menu.group({
                            items: [
                                menu.subMenu({
                                    name: 'Background color',
                                    prefix: ColorPickerIcon(),
                                    options: {
                                        items: [
                                            { name: 'Default', color: undefined },
                                            ...colorList,
                                        ].map(item => menu.action({
                                            prefix: html `<div
                        style="color: ${item.color ??
                                                cssVarV2.layer.background
                                                    .primary};display: flex;align-items: center;justify-content: center;"
                      >
                        ${TextBackgroundDuotoneIcon}
                      </div>`,
                                            name: item.name,
                                            isSelected: column.backgroundColor === item.color,
                                            select: () => {
                                                this.dataManager.setColumnBackgroundColor(column.columnId, item.color);
                                            },
                                        })),
                                    },
                                }),
                                ...(column.backgroundColor
                                    ? [
                                        menu.action({
                                            name: 'Clear column style',
                                            prefix: CloseIcon(),
                                            select: () => {
                                                this.dataManager.setColumnBackgroundColor(column.columnId, undefined);
                                            },
                                        }),
                                    ]
                                    : []),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Insert Left',
                                    prefix: InsertLeftIcon(),
                                    select: () => {
                                        this.dataManager.insertColumn(columnIndex > 0 ? columnIndex - 1 : undefined);
                                    },
                                }),
                                menu.action({
                                    name: 'Insert Right',
                                    prefix: InsertRightIcon(),
                                    select: () => {
                                        this.dataManager.insertColumn(columnIndex);
                                    },
                                }),
                                menu.action({
                                    name: 'Move Left',
                                    prefix: ArrowLeftBigIcon(),
                                    select: () => {
                                        this.dataManager.moveColumn(columnIndex, columnIndex - 2);
                                    },
                                }),
                                menu.action({
                                    name: 'Move Right',
                                    prefix: ArrowRightBigIcon(),
                                    select: () => {
                                        this.dataManager.moveColumn(columnIndex, columnIndex + 1);
                                    },
                                }),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Duplicate',
                                    prefix: DuplicateIcon(),
                                    select: () => {
                                        this.dataManager.duplicateColumn(columnIndex);
                                    },
                                }),
                                menu.action({
                                    name: 'Clear column contents',
                                    prefix: CloseIcon(),
                                    select: () => {
                                        this.dataManager.clearColumn(column.columnId);
                                    },
                                }),
                                menu.action({
                                    name: 'Delete',
                                    class: {
                                        'delete-item': true,
                                    },
                                    prefix: DeleteIcon(),
                                    select: () => {
                                        this.dataManager.deleteColumn(column.columnId);
                                    },
                                }),
                            ],
                        }),
                    ],
                },
            });
        }
        openRowOptions(target, row, rowIndex) {
            this.selectionController.setSelected({
                type: 'row',
                rowId: row.rowId,
            });
            popMenu(target, {
                options: {
                    onClose: () => {
                        this.selectionController.setSelected(undefined);
                    },
                    items: [
                        menu.group({
                            items: [
                                menu.subMenu({
                                    name: 'Background color',
                                    prefix: ColorPickerIcon(),
                                    options: {
                                        items: [
                                            { name: 'Default', color: undefined },
                                            ...colorList,
                                        ].map(item => menu.action({
                                            prefix: html `<div
                        style="color: ${item.color ??
                                                cssVarV2.layer.background
                                                    .primary};display: flex;align-items: center;justify-content: center;"
                      >
                        ${TextBackgroundDuotoneIcon}
                      </div>`,
                                            name: item.name,
                                            isSelected: row.backgroundColor === item.color,
                                            select: () => {
                                                this.dataManager.setRowBackgroundColor(row.rowId, item.color);
                                            },
                                        })),
                                    },
                                }),
                                ...(row.backgroundColor
                                    ? [
                                        menu.action({
                                            name: 'Clear row style',
                                            prefix: CloseIcon(),
                                            select: () => {
                                                this.dataManager.setRowBackgroundColor(row.rowId, undefined);
                                            },
                                        }),
                                    ]
                                    : []),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Insert Above',
                                    prefix: InsertAboveIcon(),
                                    select: () => {
                                        this.dataManager.insertRow(rowIndex > 0 ? rowIndex - 1 : undefined);
                                    },
                                }),
                                menu.action({
                                    name: 'Insert Below',
                                    prefix: InsertBelowIcon(),
                                    select: () => {
                                        this.dataManager.insertRow(rowIndex);
                                    },
                                }),
                                menu.action({
                                    name: 'Move Up',
                                    prefix: ArrowUpBigIcon(),
                                    select: () => {
                                        this.dataManager.moveRow(rowIndex, rowIndex - 1);
                                    },
                                }),
                                menu.action({
                                    name: 'Move Down',
                                    prefix: ArrowDownBigIcon(),
                                    select: () => {
                                        this.dataManager.moveRow(rowIndex, rowIndex + 1);
                                    },
                                }),
                            ],
                        }),
                        menu.group({
                            items: [
                                menu.action({
                                    name: 'Duplicate',
                                    prefix: DuplicateIcon(),
                                    select: () => {
                                        this.dataManager.duplicateRow(rowIndex);
                                    },
                                }),
                                menu.action({
                                    name: 'Clear row contents',
                                    prefix: CloseIcon(),
                                    select: () => {
                                        this.dataManager.clearRow(row.rowId);
                                    },
                                }),
                                menu.action({
                                    name: 'Delete',
                                    class: {
                                        'delete-item': true,
                                    },
                                    prefix: DeleteIcon(),
                                    select: () => {
                                        this.dataManager.deleteRow(row.rowId);
                                    },
                                }),
                            ],
                        }),
                    ],
                },
            });
        }
        createColorPickerMenu(currentColor, select) {
            return menu.subMenu({
                name: 'Background color',
                prefix: ColorPickerIcon(),
                options: {
                    items: [{ name: 'Default', color: undefined }, ...colorList].map(item => menu.action({
                        prefix: html `<div
              style="color: ${item.color ??
                            cssVarV2.layer.background
                                .primary};display: flex;align-items: center;justify-content: center;"
            >
              ${TextBackgroundDuotoneIcon}
            </div>`,
                        name: item.name,
                        isSelected: currentColor === item.color,
                        select: () => {
                            select(item.color);
                        },
                    })),
                },
            });
        }
        onContextMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            const selected = this.selectionController.selected$.value;
            if (!selected) {
                return;
            }
            if (selected.type === 'area' && e.currentTarget instanceof HTMLElement) {
                const target = popupTargetFromElement(e.currentTarget);
                popMenu(target, {
                    options: {
                        items: [
                            menu.group({
                                items: [
                                    menu.action({
                                        name: 'Copy',
                                        prefix: CopyIcon(),
                                        select: () => {
                                            this.selectionController.doCopyOrCut(selected, false);
                                        },
                                    }),
                                    menu.action({
                                        name: 'Paste',
                                        prefix: PasteIcon(),
                                        select: () => {
                                            // oxlint-disable-next-line @typescript-eslint/no-floating-promises
                                            navigator.clipboard.readText().then(text => {
                                                this.selectionController.doPaste(text, selected);
                                            });
                                        },
                                    }),
                                ],
                            }),
                            menu.group({
                                items: [
                                    menu.action({
                                        name: 'Clear contents',
                                        prefix: CloseIcon(),
                                        select: () => {
                                            this.dataManager.clearCellsBySelection(selected);
                                        },
                                    }),
                                ],
                            }),
                        ],
                    },
                });
            }
        }
        renderColumnOptions(column, columnIndex) {
            const openColumnOptions = (e) => {
                e.stopPropagation();
                const element = e.currentTarget;
                if (element instanceof HTMLElement) {
                    this.openColumnOptions(popupTargetFromElement(element), column, columnIndex);
                }
            };
            return html `<div class=${columnOptionsCellStyle}>
      <div
        data-testid="drag-column-handle"
        data-drag-column-id=${column.columnId}
        class=${classMap({
                [columnOptionsStyle]: true,
            })}
        style=${styleMap({
                opacity: columnIndex === this.hoverColumnIndex$.value ? 1 : undefined,
            })}
        @click=${openColumnOptions}
      >
        ${threePointerIcon()}
      </div>
    </div>`;
        }
        renderRowOptions(row, rowIndex) {
            const openRowOptions = (e) => {
                e.stopPropagation();
                const element = e.currentTarget;
                if (element instanceof HTMLElement) {
                    this.openRowOptions(popupTargetFromElement(element), row, rowIndex);
                }
            };
            return html `<div class=${rowOptionsCellStyle}>
      <div
        data-testid="drag-row-handle"
        data-drag-row-id=${row.rowId}
        class=${classMap({
                [rowOptionsStyle]: true,
            })}
        style=${styleMap({
                opacity: rowIndex === this.hoverRowIndex$.value ? 1 : undefined,
            })}
        @click=${openRowOptions}
      >
        ${threePointerIcon(true)}
      </div>
    </div>`;
        }
        renderOptionsButton() {
            if (this.readonly || !this.row || !this.column) {
                return nothing;
            }
            return html `
      ${this.rowIndex === 0
                ? this.renderColumnOptions(this.column, this.columnIndex)
                : nothing}
      ${this.columnIndex === 0
                ? this.renderRowOptions(this.row, this.rowIndex)
                : nothing}
    `;
        }
        tdMouseEnter(rowIndex, columnIndex) {
            this.hoverColumnIndex$.value = columnIndex;
            this.hoverRowIndex$.value = rowIndex;
        }
        tdMouseLeave() {
            this.hoverColumnIndex$.value = undefined;
            this.hoverRowIndex$.value = undefined;
        }
        tdStyle() {
            const columnWidth = this.virtualWidth$.value ?? this.column?.width;
            const backgroundColor = this.column?.backgroundColor ?? this.row?.backgroundColor ?? undefined;
            return styleMap({
                backgroundColor,
                minWidth: columnWidth ? `${columnWidth}px` : `${DefaultColumnWidth}px`,
                maxWidth: columnWidth ? `${columnWidth}px` : `${ColumnMaxWidth}px`,
            });
        }
        renderRowIndicator() {
            if (this.readonly) {
                return nothing;
            }
            const columnIndex = this.columnIndex;
            const isFirstColumn = columnIndex === 0;
            const isLastColumn = columnIndex === this.dataManager.uiColumns$.value.length - 1;
            const showIndicator = this.showRowIndicator$.value;
            const style = (show) => styleMap({
                opacity: show ? 1 : 0,
                borderRadius: isFirstColumn
                    ? '3px 0 0 3px'
                    : isLastColumn
                        ? '0 3px 3px 0'
                        : '0',
            });
            const indicator0 = this.rowIndex === 0
                ? html `
            <div
              style=${style(showIndicator === 'top')}
              class=${rowTopIndicatorStyle}
            ></div>
          `
                : nothing;
            return html `
      ${indicator0}
      <div
        style=${style(showIndicator === 'bottom')}
        class=${rowBottomIndicatorStyle}
      ></div>
    `;
        }
        renderColumnIndicator() {
            if (this.readonly) {
                return nothing;
            }
            const hoverColumnId$ = this.dataManager.hoverDragHandleColumnId$;
            const draggingColumnId$ = this.dataManager.widthAdjustColumnId$;
            const rowIndex = this.rowIndex;
            const isFirstRow = rowIndex === 0;
            const isLastRow = rowIndex === this.dataManager.uiRows$.value.length - 1;
            const showWidthAdjustIndicator = draggingColumnId$.value === this.column?.columnId ||
                hoverColumnId$.value === this.column?.columnId;
            const showIndicator = this.showColumnIndicator$.value;
            const style = (show) => styleMap({
                opacity: show ? 1 : 0,
                borderRadius: isFirstRow
                    ? '3px 3px 0 0'
                    : isLastRow
                        ? '0 0 3px 3px'
                        : '0',
            });
            const indicator0 = this.columnIndex === 0
                ? html `
            <div
              style=${style(showIndicator === 'left')}
              class=${columnLeftIndicatorStyle}
            ></div>
          `
                : nothing;
            const mouseEnter = () => {
                hoverColumnId$.value = this.column?.columnId;
            };
            const mouseLeave = () => {
                hoverColumnId$.value = undefined;
            };
            return html ` ${indicator0}
      <div
        @mouseenter=${mouseEnter}
        @mouseleave=${mouseLeave}
        style=${style(showWidthAdjustIndicator || showIndicator === 'right')}
        data-width-adjust-column-id=${this.column?.columnId}
        class=${columnRightIndicatorStyle}
      ></div>`;
        }
        get inlineEditor() {
            return this.richText$.value?.inlineEditor;
        }
        connectedCallback() {
            super.connectedCallback();
            if (this.readonly) {
                return;
            }
            const selectAll = (e) => {
                if (e.key === 'a' && (IS_MAC ? e.metaKey : e.ctrlKey)) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.inlineEditor?.selectAll();
                }
            };
            this.disposables.addFromEvent(this, 'keydown', selectAll);
            this.disposables.addFromEvent(this, 'click', (e) => {
                e.stopPropagation();
                requestAnimationFrame(() => {
                    if (!this.inlineEditor?.inlineRange$.value) {
                        this.inlineEditor?.focusEnd();
                    }
                });
            });
        }
        firstUpdated() {
            if (this.readonly) {
                return;
            }
            this.richText$.value?.updateComplete
                .then(() => {
                const inlineEditor = this.inlineEditor;
                if (inlineEditor) {
                    this.disposables.add(inlineEditor.slots.keydown.subscribe(this._handleKeyDown));
                }
                this.disposables.add(effect(() => {
                    const richText = this.richText$.value;
                    if (!richText) {
                        return;
                    }
                    const inlineEditor = this.inlineEditor;
                    if (!inlineEditor) {
                        return;
                    }
                    const inlineRange = inlineEditor.inlineRange$.value;
                    const targetSelection = {
                        type: 'area',
                        rowStartIndex: this.rowIndex,
                        rowEndIndex: this.rowIndex,
                        columnStartIndex: this.columnIndex,
                        columnEndIndex: this.columnIndex,
                    };
                    const currentSelection = this.selectionController.selected$.peek();
                    if (inlineRange &&
                        !TableSelectionData.equals(targetSelection, currentSelection)) {
                        this.selectionController.setSelected(targetSelection, false);
                    }
                }));
            })
                .catch(console.error);
        }
        render() {
            if (!this.text) {
                return html `<td class=${cellContainerStyle} style=${this.tdStyle()}>
        <div
          style=${styleMap({
                    padding: '8px 12px',
                })}
        >
          <div style="height:22px"></div>
        </div>
      </td>`;
            }
            return html `
      <td
        data-row-id=${this.row?.rowId}
        data-column-id=${this.column?.columnId}
        @mouseenter=${() => {
                this.tdMouseEnter(this.rowIndex, this.columnIndex);
            }}
        @mouseleave=${() => {
                this.tdMouseLeave();
            }}
        @contextmenu=${this.onContextMenu}
        class=${cellContainerStyle}
        style=${this.tdStyle()}
      >
        <rich-text
          ${ref(this.richText$)}
          data-disable-ask-ai
          data-not-block-text
          style=${styleMap({
                minHeight: '22px',
                padding: '8px 12px',
            })}
          .yText="${this.text}"
          .inlineEventSource="${this.topContenteditableElement ?? nothing}"
          .attributesSchema="${this.inlineManager?.getSchema()}"
          .attributeRenderer="${this.inlineManager?.getRenderer()}"
          .embedChecker="${this.inlineManager?.embedChecker}"
          .markdownMatches="${this.inlineManager?.markdownMatches}"
          .readonly="${this.readonly}"
          .enableClipboard="${true}"
          .verticalScrollContainerGetter="${() => this.topContenteditableElement?.host
                ? getViewportElement(this.topContenteditableElement.host)
                : null}"
          data-parent-flavour="affine:table"
        ></rich-text>
        ${this.renderOptionsButton()} ${this.renderColumnIndicator()}
        ${this.renderRowIndicator()}
      </td>
    `;
        }
    };
})();
export { TableCell };
export const createColumnDragPreview = (cells) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.opacity = '0.8';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.zIndex = '1000';
    container.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.1)';
    container.style.backgroundColor = cssVarV2.layer.background.primary;
    cells.forEach((cell, index) => {
        const div = document.createElement('div');
        const td = cell.querySelector('td');
        if (index !== 0) {
            div.style.borderTop = `1px solid ${cssVarV2.layer.insideBorder.border}`;
        }
        if (td) {
            div.style.height = `${td.getBoundingClientRect().height}px`;
        }
        if (cell.text) {
            const text = new RichText();
            text.style.padding = '8px 12px';
            text.yText = cell.text;
            text.readonly = true;
            text.attributesSchema = cell.inlineManager?.getSchema();
            text.attributeRenderer = cell.inlineManager?.getRenderer();
            text.embedChecker = cell.inlineManager?.embedChecker ?? (() => false);
            div.append(text);
        }
        container.append(div);
    });
    return container;
};
export const createRowDragPreview = (cells) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.opacity = '0.8';
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.zIndex = '1000';
    container.style.boxShadow = '0 0 10px 0 rgba(0, 0, 0, 0.1)';
    container.style.backgroundColor = cssVarV2.layer.background.primary;
    cells.forEach((cell, index) => {
        const div = document.createElement('div');
        const td = cell.querySelector('td');
        if (index !== 0) {
            div.style.borderLeft = `1px solid ${cssVarV2.layer.insideBorder.border}`;
        }
        if (td) {
            div.style.width = `${td.getBoundingClientRect().width}px`;
        }
        if (cell.text) {
            const text = new RichText();
            text.style.padding = '8px 12px';
            text.yText = cell.text;
            text.readonly = true;
            text.attributesSchema = cell.inlineManager?.getSchema();
            text.attributeRenderer = cell.inlineManager?.getRenderer();
            text.embedChecker = cell.inlineManager?.embedChecker ?? (() => false);
            div.append(text);
        }
        container.append(div);
    });
    return container;
};
const threePointerIcon = (vertical = false) => {
    return html `
    <div
      class=${threePointerIconStyle}
      style=${styleMap({
        transform: vertical ? 'rotate(90deg)' : undefined,
    })}
    >
      <div class=${threePointerIconDotStyle}></div>
      <div class=${threePointerIconDotStyle}></div>
      <div class=${threePointerIconDotStyle}></div>
    </div>
  `;
};
