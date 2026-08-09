import { menu, popMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { AddCursorIcon } from '@blocksuite/icons/lit';
import { computed, signal } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';
import { dv } from '../../../core/common/dv-css.js';
import { groupTraitKey, } from '../../../core/group-by/trait.js';
import { createUniComponentFromWebComponent, renderUniLit, } from '../../../core/index.js';
import { DataViewUIBase, DataViewUILogicBase, } from '../../../core/view/data-view-base.js';
import { LEFT_TOOL_BAR_WIDTH } from '../consts.js';
import { TableViewRowSelection, } from '../selection.js';
import { TableClipboardController } from './controller/clipboard.js';
import { TableDragController } from './controller/drag.js';
import { TableHotkeysController } from './controller/hotkeys.js';
import { TableSelectionController } from './controller/selection.js';
import { TableGroupFooter } from './group/bottom/group-footer.js';
import { TableGroupHeader } from './group/top/group-header.js';
import { DatabaseCellContainer } from './row/cell.js';
import { TableRowHeader } from './row/row-header.js';
import { TableRowLast } from './row/row-last.js';
import * as styles from './table-view-css.js';
import { getScrollContainer, GridVirtualScroll, } from './virtual/virtual-scroll.js';
export class VirtualTableViewUILogic extends DataViewUILogicBase {
    constructor() {
        super(...arguments);
        this.ui$ = signal();
        this.clipboardController = new TableClipboardController(this);
        this.dragController = new TableDragController(this);
        this.hotkeysController = new TableHotkeysController(this);
        this.selectionController = new TableSelectionController(this);
        this.virtualScroll$ = signal();
        this.columns$ = computed(() => {
            return [
                {
                    id: 'row-header',
                    width: LEFT_TOOL_BAR_WIDTH,
                },
                ...this.view.properties$.value.map(property => ({
                    id: property.id,
                    width: property.width$.value + 1,
                })),
                {
                    id: 'row-last',
                    width: 40,
                },
            ];
        });
        this.groupTrait$ = computed(() => {
            return this.view.traitGet(groupTraitKey);
        });
        this.groups$ = computed(() => {
            const groupTrait = this.groupTrait$.value;
            if (!groupTrait?.groupsDataList$.value) {
                return [
                    {
                        id: '',
                        rows: this.view.rowIds$.value,
                    },
                ];
            }
            const groups = groupTrait.groupsDataList$.value.filter((group) => group != null);
            return groups.map(group => ({
                id: group.key,
                rows: group.rows.map(v => v.rowId),
            }));
        });
        this.clearSelection = () => {
            this.selectionController.clear();
        };
        this.addRow = (position) => {
            return this.view.rowAdd(position);
        };
        this.focusFirstCell = () => {
            this.selectionController.focusFirstCell();
        };
        this.showIndicator = (evt) => {
            return this.dragController.showIndicator(evt) != null;
        };
        this.hideIndicator = () => {
            this.dragController.dropPreview.remove();
        };
        this.moveTo = (id, evt) => {
            const result = this.dragController.getInsertPosition(evt);
            if (result) {
                const row = this.view.rowGetOrCreate(id);
                row.move(result.position, undefined, result.groupKey);
            }
        };
        this.onWheel = (event) => {
            if (event.metaKey || event.ctrlKey) {
                return;
            }
            const ele = event.currentTarget;
            if (ele instanceof HTMLElement) {
                if (ele.scrollWidth === ele.clientWidth) {
                    return;
                }
                event.stopPropagation();
            }
        };
        this.renderAddGroup = (groupHelper) => {
            const addGroup = groupHelper.addGroup;
            if (!addGroup) {
                return;
            }
            const add = (e) => {
                const ele = e.currentTarget;
                popMenu(popupTargetFromElement(ele), {
                    options: {
                        items: [
                            menu.input({
                                onComplete: text => {
                                    const column = groupHelper.property$.value;
                                    if (column) {
                                        column.dataUpdate(() => addGroup({
                                            text,
                                            oldData: column.data$.value,
                                            dataSource: this.view.manager.dataSource,
                                        }));
                                    }
                                },
                            }),
                        ],
                    },
                });
            };
            return html ` <div style="display:flex;">
      <div class="${dv.hover} ${dv.round8} ${styles.addGroup}" @click="${add}">
        <div class="${dv.icon16}" style="display:flex;">${AddCursorIcon()}</div>
        <div>New Group</div>
      </div>
    </div>`;
        };
        this.renderer = createUniComponentFromWebComponent(TableViewUI);
    }
    initVirtualScroll(yScrollContainer, ui) {
        const virtualScroll = new GridVirtualScroll({
            initGroupData: group => ({
                hover$: computed(() => {
                    const headerHover = group.data.headerHover$.value;
                    if (headerHover) {
                        return true;
                    }
                    const footerHover = group.data.footerHover$.value;
                    if (footerHover) {
                        return true;
                    }
                    return group.rows$.value.some(row => row.data.hover$.value);
                }),
                headerHover$: signal(false),
                footerHover$: signal(false),
            }),
            initRowData: row => ({
                hover$: computed(() => {
                    return row.cells$.value.some(cell => cell.data.hover$.value);
                }),
                selected$: computed(() => {
                    const selection = this.selection$.value;
                    if (!selection || selection.selectionType !== 'row') {
                        return false;
                    }
                    const groupId = row.group.groupId;
                    return TableViewRowSelection.includes(selection, {
                        id: row.rowId,
                        groupKey: groupId ? groupId : undefined,
                    });
                }),
            }),
            initCellData: () => ({
                hover$: signal(false),
                selected$: signal(false),
            }),
            columns$: this.columns$,
            groups$: this.groups$,
            createCell: (cell, wrapper) => {
                if (cell.columnId === 'row-header') {
                    wrapper.style.borderBottom = `1px solid ${cssVarV2.database.border}`;
                    const rowHeader = new TableRowHeader();
                    rowHeader.gridCell = cell;
                    rowHeader.tableViewLogic = this;
                    return rowHeader;
                }
                if (cell.columnId === 'row-last') {
                    const rowLast = new TableRowLast();
                    rowLast.gridCell = cell;
                    rowLast.tableViewLogic = this;
                    return rowLast;
                }
                const cellContainer = new DatabaseCellContainer();
                cellContainer.gridCell = cell;
                cellContainer.tableViewLogic = this;
                return cellContainer;
            },
            createGroup: {
                top: gridGroup => {
                    const groupHeader = new TableGroupHeader();
                    groupHeader.tableViewLogic = this;
                    groupHeader.gridGroup = gridGroup;
                    return groupHeader;
                },
                bottom: gridGroup => {
                    const groupFooter = new TableGroupFooter();
                    groupFooter.tableViewLogic = this;
                    groupFooter.gridGroup = gridGroup;
                    return groupFooter;
                },
            },
            fixedRowHeight$: signal(undefined),
            yScrollContainer,
        });
        this.yScrollContainer = yScrollContainer;
        this.virtualScroll$.value = virtualScroll;
        requestAnimationFrame(() => {
            if (virtualScroll) {
                virtualScroll.init();
                ui.disposables.add(() => virtualScroll.dispose());
            }
        });
    }
}
export class TableViewUI extends DataViewUIBase {
    renderTable() {
        return this.logic.virtualScroll$.value?.content;
    }
    connectedCallback() {
        super.connectedCallback();
        this.logic.ui$.value = this;
        this.logic.clipboardController.hostConnected();
        this.logic.dragController.hostConnected();
        this.logic.hotkeysController.hostConnected();
        this.logic.selectionController.hostConnected();
        const scrollContainer = getScrollContainer(this, 'y') ?? document.body;
        this.logic.initVirtualScroll(scrollContainer, this);
        this.classList.add(styles.tableView);
    }
    render() {
        const vPadding = this.logic.root.config.virtualPadding$.value;
        const wrapperStyle = styleMap({
            marginLeft: `-${vPadding}px`,
            marginRight: `-${vPadding}px`,
        });
        const containerStyle = styleMap({
            paddingLeft: `${vPadding}px`,
            paddingRight: `${vPadding}px`,
        });
        return html `
      ${renderUniLit(this.logic.root.config.headerWidget, {
            dataViewLogic: this.logic,
        })}
      <div class="${styles.tableContainer}" style="${wrapperStyle}">
        <div class="${styles.tableBlockTable}" @wheel="${this.logic.onWheel}">
          <div class="${styles.tableContainer2}" style="${containerStyle}">
            ${this.renderTable()}
          </div>
        </div>
      </div>
    `;
    }
}
