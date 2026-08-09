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
import { getRangeByPositions } from '@blocksuite/affine-shared/utils';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { autoScrollOnBoundary } from '../../../../core/utils/auto-scroll.js';
import { startDrag } from '../../../../core/utils/drag.js';
import { RowWithGroup, TableViewAreaSelection, TableViewRowSelection, } from '../../selection';
import { DragToFillElement, fillSelectionWithFocusCellData, } from './drag-to-fill.js';
export class TableSelectionController {
    // private get areaSelectionElement() {
    //   return this.__selectionElement;
    // }
    get dragToFillDraggable() {
        return this.__dragToFillElement.dragToFillRef.value;
    }
    // private get focusSelectionElement() {
    //   return this.__selectionElement;
    // }
    get selection() {
        return this._tableViewSelection;
    }
    set selection(data) {
        if (!data) {
            this.clearSelection();
            return;
        }
        const selection = {
            ...data,
            viewId: this.view.id,
            type: 'table',
        };
        if (selection.selectionType === 'area' && selection.isEditing) {
            const focus = selection.focus;
            const container = this.getCellContainer(selection.groupKey, focus.rowIndex, focus.columnIndex);
            const cell = container?.cell;
            const isEditing = cell ? cell.beforeEnterEditMode() : true;
            this.logic.setSelection({
                ...selection,
                isEditing,
            });
        }
        else {
            this.logic.setSelection(selection);
        }
    }
    get tableContainer() {
        return this.virtualScroll?.content.parentElement;
    }
    get view() {
        return this.logic.view;
    }
    constructor(logic) {
        this.logic = logic;
        this.disposables = new DisposableGroup();
        this.getFocusCellContainer = () => {
            if (!this._tableViewSelection ||
                this._tableViewSelection.selectionType !== 'area')
                return null;
            const { groupKey, focus } = this._tableViewSelection;
            const dragStartCell = this.getCellContainer(groupKey, focus.rowIndex, focus.columnIndex);
            return dragStartCell ?? null;
        };
        this.__dragToFillElement = new DragToFillElement();
        this.selectionStyleUpdateTask = 0;
        this.columnPositions$ = computed(() => {
            const columnPositions = this.virtualScroll?.columnPosition$.value?.slice(1);
            if (columnPositions == null) {
                return [];
            }
            return columnPositions;
        });
        this.columnOffsets$ = computed(() => {
            const columnPositions = this.columnPositions$.value;
            if (columnPositions == null) {
                return [];
            }
            const firstLeft = columnPositions[0]?.left;
            if (firstLeft == null) {
                return [];
            }
            const rights = columnPositions.map(v => v.right);
            if (rights == null) {
                return [];
            }
            return [firstLeft, ...rights];
        });
        this.groupRowOffsets$ = computed(() => {
            return Object.fromEntries(this.virtualScroll?.groups$.value.map(group => {
                return [
                    group.groupId,
                    computed(() => {
                        const firstTop = group.rowsTop$.value;
                        if (firstTop == null) {
                            return [];
                        }
                        const offsets = [firstTop];
                        for (const row of group.rows$.value) {
                            if (row.bottom$.value == null) {
                                break;
                            }
                            offsets.push(row.bottom$.value);
                        }
                        return offsets;
                    }),
                ];
            }) ?? []);
        });
        this.__selectionElement = new SelectionElement();
        this.__selectionElement.controller = this;
    }
    get host() {
        return this.logic.ui$.value;
    }
    clearSelection() {
        this.logic.setSelection();
    }
    handleDragEvent() {
        this.disposables.add(this.logic.handleEvent('dragStart', context => {
            if (this.logic.view.readonly$.value) {
                return;
            }
            const event = context.get('pointerState').raw;
            const target = event.target;
            if (target instanceof HTMLElement) {
                const [cell, fillValues] = this.resolveDragStartTarget(target);
                if (cell) {
                    const selection = this.selection;
                    if (selection &&
                        selection.selectionType === 'area' &&
                        selection.isEditing &&
                        selection.focus.rowIndex === cell.rowIndex$.value &&
                        selection.focus.columnIndex === cell.columnIndex$.value) {
                        return false;
                    }
                    this.startDrag(event, cell, fillValues);
                    event.preventDefault();
                    return true;
                }
                return false;
            }
            return false;
        }));
    }
    handleSelectionChange() {
        this.disposables.add(this.logic.selection$.subscribe(tableSelection => {
            if (!this.isValidSelection(tableSelection)) {
                this.selection = undefined;
                return;
            }
            const old = this._tableViewSelection?.selectionType === 'area'
                ? this._tableViewSelection
                : undefined;
            const newSelection = tableSelection?.selectionType === 'area' ? tableSelection : undefined;
            if (old?.focus.rowIndex !== newSelection?.focus.rowIndex ||
                old?.focus.columnIndex !== newSelection?.focus.columnIndex) {
                requestAnimationFrame(() => {
                    this.scrollToFocus();
                });
            }
            if (this.isRowSelection() &&
                (old?.rowsSelection?.start !== newSelection?.rowsSelection?.start ||
                    old?.rowsSelection?.end !== newSelection?.rowsSelection?.end)) {
                requestAnimationFrame(() => {
                    this.scrollToAreaSelection();
                });
            }
            if (old) {
                const container = this.getCellContainer(old.groupKey, old.focus.rowIndex, old.focus.columnIndex);
                if (container) {
                    const cell = container.cell;
                    if (old.isEditing) {
                        cell?.beforeExitEditingMode();
                        cell?.blurCell();
                        container.isEditing$.value = false;
                    }
                }
            }
            this._tableViewSelection = tableSelection;
            if (newSelection) {
                const container = this.getCellContainer(newSelection.groupKey, newSelection.focus.rowIndex, newSelection.focus.columnIndex);
                if (container) {
                    const cell = container.cell;
                    if (newSelection.isEditing) {
                        container.isEditing$.value = true;
                        requestAnimationFrame(() => {
                            cell?.afterEnterEditingMode();
                            cell?.focusCell();
                        });
                    }
                }
            }
        }));
    }
    insertTo(groupKey, rowId, before) {
        const id = this.view.rowAdd({ before, id: rowId });
        if (groupKey != null) {
            this.view.groupTrait.moveCardTo(id, undefined, groupKey, {
                before,
                id: rowId,
            });
        }
        const rows = groupKey != null
            ? this.view.groupTrait.groupDataMap$.value?.[groupKey]?.rows
            : this.view.rows$.value;
        requestAnimationFrame(() => {
            const index = this.view.properties$.value.findIndex(v => v.type$.value === 'title');
            this.selection = TableViewAreaSelection.create({
                groupKey: groupKey,
                focus: {
                    rowIndex: rows?.findIndex(v => v.rowId === id) ?? 0,
                    columnIndex: index,
                },
                isEditing: true,
            });
        });
    }
    resolveDragStartTarget(target) {
        let cell;
        const fillValues = !!target.dataset.dragToFill;
        if (fillValues) {
            const focusCellContainer = this.getFocusCellContainer();
            cell = focusCellContainer ?? null;
        }
        else {
            cell = target.closest('affine-database-virtual-cell-container');
        }
        return [cell, fillValues];
    }
    scrollToAreaSelection() {
        // this.areaSelectionElement?.scrollIntoView({
        //   block: 'nearest',
        //   inline: 'nearest',
        // });
    }
    scrollToFocus() {
        // this.focusSelectionElement?.scrollIntoView({
        //   block: 'nearest',
        //   inline: 'nearest',
        // });
    }
    areaToRows(selection) {
        const rows = this.rows(selection.groupKey ?? '') ?? [];
        const ids = Array.from({
            length: selection.rowsSelection.end - selection.rowsSelection.start + 1,
        })
            .map((_, index) => index + selection.rowsSelection.start)
            .map(row => rows[row]?.rowId)
            .filter((id) => id != null);
        return ids.map(id => ({ id, groupKey: selection.groupKey }));
    }
    cellPosition(groupKey) {
        const containerRect = this.virtualScroll?.content.getBoundingClientRect();
        if (containerRect == null) {
            return;
        }
        return (x1, x2, y1, y2) => {
            x1 = x1 - containerRect.left;
            x2 = x2 - containerRect.left;
            y1 = y1 - containerRect.top;
            y2 = y2 - containerRect.top;
            const rowOffsets = this.groupRowOffsets$.value[groupKey ?? ''];
            if (rowOffsets == null) {
                return;
            }
            const [startX, endX] = x1 < x2 ? [x1, x2] : [x2, x1];
            const [startY, endY] = y1 < y2 ? [y1, y2] : [y2, y1];
            const column = getRangeByPositions(this.columnOffsets$.value, startX, endX);
            const row = getRangeByPositions(rowOffsets.value, startY, endY);
            return {
                row,
                column,
            };
        };
    }
    clear() {
        this.selection = undefined;
    }
    deleteRow(rowId) {
        this.view.rowsDelete([rowId]);
        this.focusToCell('up');
        this.logic.ui$.value?.requestUpdate();
    }
    focusFirstCell() {
        this.selection = TableViewAreaSelection.create({
            focus: {
                rowIndex: 0,
                columnIndex: 0,
            },
            isEditing: false,
        });
    }
    focusToArea(selection) {
        return {
            ...selection,
            rowsSelection: selection.rowsSelection ?? {
                start: selection.focus.rowIndex,
                end: selection.focus.rowIndex,
            },
            columnsSelection: selection.columnsSelection ?? {
                start: selection.focus.columnIndex,
                end: selection.focus.columnIndex,
            },
            isEditing: false,
        };
    }
    focusToCell(position) {
        if (!this.selection || this.selection.selectionType !== 'area') {
            return;
        }
        const cell = this.getCellContainer(this.selection.groupKey, this.selection.focus.rowIndex, this.selection.focus.columnIndex);
        if (!cell) {
            return;
        }
        const row = cell.gridCell.row;
        const rows = row.group.rows$.value;
        let rowIndex = row.rowIndex$.value;
        let columnIndex = cell.columnIndex$.value;
        const columns = this.columnPositions$.value;
        if (position === 'left') {
            if (columnIndex === 0) {
                columnIndex = columns.length - 1;
                rowIndex--;
            }
            else {
                columnIndex--;
            }
        }
        if (position === 'right') {
            if (columnIndex === columns.length - 1) {
                columnIndex = 0;
                rowIndex++;
            }
            else {
                columnIndex++;
            }
        }
        if (position === 'up') {
            if (rowIndex === 0) {
                //
            }
            else {
                rowIndex--;
            }
        }
        if (position === 'down') {
            if (rowIndex === rows.length - 1) {
                //
            }
            else {
                rowIndex++;
            }
        }
        const cellContainer = this.getCellContainer(this.selection.groupKey, rowIndex, columnIndex);
        if (!cellContainer) {
            return;
        }
        cellContainer.selectCurrentCell(false);
    }
    getCellElement(cell) {
        return (cell.element.querySelector('affine-database-virtual-cell-container') ??
            undefined);
    }
    getCellByIndex(groupKey, rowIndex, columnIndex) {
        const row = this.rows(groupKey)?.[rowIndex];
        if (!row) {
            return;
        }
        const cell = row.cells$.value[columnIndex + 1];
        return cell;
    }
    getCellContainer(groupKey, rowIndex, columnIndex) {
        const cell = this.getCellByIndex(groupKey, rowIndex, columnIndex);
        if (!cell) {
            return;
        }
        return this.getCellElement(cell);
    }
    getRect(groupKey, topIndex, bottomIndex, leftIndex, rightIndex) {
        const rows = this.rows(groupKey);
        const top = rows?.[topIndex]?.top$.value;
        const bottom = rows?.[bottomIndex]?.bottom$.value;
        if (top == null || bottom == null) {
            return;
        }
        const left = this.columnPositions$.value[leftIndex]?.left;
        const right = this.columnPositions$.value[rightIndex]?.right;
        if (left == null || right == null) {
            return;
        }
        return {
            top,
            left,
            width: right - left,
            height: bottom - top,
            scale: 1,
        };
    }
    getSelectionAreaBorder(position) {
        return this.__selectionElement?.querySelector(`.area-border.area-${position}`);
    }
    hostConnected() {
        requestAnimationFrame(() => {
            this.tableContainer?.append(this.__selectionElement);
            this.tableContainer?.append(this.__dragToFillElement);
        });
        this.handleDragEvent();
        this.handleSelectionChange();
    }
    insertRowAfter(groupKey, rowId) {
        this.insertTo(groupKey, rowId, false);
    }
    insertRowBefore(groupKey, rowId) {
        this.insertTo(groupKey, rowId, true);
    }
    isRowSelection() {
        return this.selection?.selectionType === 'row';
    }
    isValidSelection(selection) {
        if (!selection || selection.selectionType === 'row') {
            return true;
        }
        if (selection.focus.rowIndex > this.view.rows$.value.length - 1) {
            this.selection = undefined;
            return false;
        }
        if (selection.focus.columnIndex > this.view.propertyIds$.value.length - 1) {
            this.selection = undefined;
            return false;
        }
        return true;
    }
    navigateRowSelection(direction, append = false) {
        if (!TableViewRowSelection.is(this.selection))
            return;
        const rows = this.selection.rows;
        const lastRow = rows[rows.length - 1];
        if (!lastRow)
            return;
        const lastRowIndex = this.getGroup(lastRow?.groupKey)?.rows$.value.find(r => r.rowId === lastRow?.id)?.rowIndex$.value ?? 0;
        const getRowByIndex = (index) => {
            const tableRow = this.rows(lastRow?.groupKey)?.[index];
            if (!tableRow) {
                return;
            }
            return {
                id: tableRow.rowId,
                groupKey: lastRow?.groupKey,
            };
        };
        const prevRow = getRowByIndex(lastRowIndex - 1);
        const nextRow = getRowByIndex(lastRowIndex + 1);
        const includes = (row) => {
            if (!row) {
                return false;
            }
            return rows.some(r => RowWithGroup.equal(r, row));
        };
        if (append) {
            const addList = [];
            const removeList = [];
            if (direction === 'up' && prevRow != null) {
                if (includes(prevRow)) {
                    removeList.push(lastRow);
                }
                else {
                    addList.push(prevRow);
                }
            }
            if (direction === 'down' && nextRow != null) {
                if (includes(nextRow)) {
                    removeList.push(lastRow);
                }
                else {
                    addList.push(nextRow);
                }
            }
            this.rowSelectionChange({ add: addList, remove: removeList });
        }
        else {
            const target = direction === 'up' ? prevRow : nextRow;
            if (target != null) {
                this.selection = TableViewRowSelection.create({
                    rows: [target],
                });
            }
        }
    }
    get virtualScroll() {
        return this.logic.virtualScroll$.value;
    }
    getGroup(groupKey) {
        return this.virtualScroll?.getGroup(groupKey ?? '');
    }
    getRow(groupKey, rowId) {
        return this.virtualScroll?.getRow(groupKey ?? '', rowId);
    }
    getCell(groupKey, rowId, columnId) {
        return this.virtualScroll?.getCell(groupKey ?? '', rowId, columnId);
    }
    rows(groupKey) {
        return this.virtualScroll?.getGroup(groupKey ?? '').rows$.value;
    }
    rowSelectionChange({ add, remove, }) {
        const key = (r) => `${r.id}.${r.groupKey ? r.groupKey : ''}`;
        const rows = new Set(TableViewRowSelection.rows(this.selection).map(r => key(r)));
        remove.forEach(row => rows.delete(key(row)));
        add.forEach(row => rows.add(key(row)));
        const result = [...rows]
            .map(r => r.split('.'))
            .flatMap(([id, groupKey]) => {
            if (id == null)
                return [];
            return [
                {
                    id,
                    groupKey: groupKey ? groupKey : undefined,
                },
            ];
        });
        this.selection = TableViewRowSelection.create({
            rows: result,
        });
    }
    rowsToArea(rows) {
        let groupKey = undefined;
        let minIndex = undefined;
        let maxIndex = undefined;
        const set = new Set(rows);
        if (!this.tableContainer)
            return;
        for (const row of this.tableContainer
            ?.querySelectorAll('data-view-table-row')
            .values() ?? []) {
            if (!set.has(row.rowId)) {
                continue;
            }
            minIndex =
                minIndex != null ? Math.min(minIndex, row.rowIndex) : row.rowIndex;
            maxIndex =
                maxIndex != null ? Math.max(maxIndex, row.rowIndex) : row.rowIndex;
            if (groupKey == null) {
                groupKey = row.groupKey;
            }
            else if (groupKey !== row.groupKey) {
                return;
            }
        }
        if (minIndex == null || maxIndex == null) {
            return;
        }
        return {
            groupKey,
            start: minIndex,
            end: maxIndex,
        };
    }
    selectionAreaDown() {
        const selection = this.selection;
        if (!selection || selection.selectionType !== 'area') {
            return;
        }
        const newSelection = this.focusToArea(selection);
        if (newSelection.rowsSelection.start === newSelection.focus.rowIndex) {
            newSelection.rowsSelection.end = Math.min((this.rows(newSelection.groupKey)?.length ?? 0) - 1, newSelection.rowsSelection.end + 1);
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('bottom')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        else {
            newSelection.rowsSelection.start += 1;
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('top')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        this.selection = newSelection;
    }
    selectionAreaLeft() {
        const selection = this.selection;
        if (!selection || selection.selectionType !== 'area') {
            return;
        }
        const newSelection = this.focusToArea(selection);
        if (newSelection.columnsSelection.end === newSelection.focus.columnIndex) {
            newSelection.columnsSelection.start = Math.max(0, newSelection.columnsSelection.start - 1);
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('left')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        else {
            newSelection.columnsSelection.end -= 1;
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('right')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        this.selection = newSelection;
    }
    selectionAreaRight() {
        const selection = this.selection;
        if (!selection || selection.selectionType !== 'area') {
            return;
        }
        const newSelection = this.focusToArea(selection);
        if (newSelection.columnsSelection.start === newSelection.focus.columnIndex) {
            const max = (this.virtualScroll?.columns$.value.length ?? 0) - 1;
            newSelection.columnsSelection.end = Math.min(max, newSelection.columnsSelection.end + 1);
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('right')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        else {
            newSelection.columnsSelection.start += 1;
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('left')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        this.selection = newSelection;
    }
    selectionAreaUp() {
        const selection = this.selection;
        if (!selection || selection.selectionType !== 'area') {
            return;
        }
        const newSelection = this.focusToArea(selection);
        if (newSelection.rowsSelection.end === newSelection.focus.rowIndex) {
            newSelection.rowsSelection.start = Math.max(0, newSelection.rowsSelection.start - 1);
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('top')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        else {
            newSelection.rowsSelection.end -= 1;
            // requestAnimationFrame(() => {
            //   this.getSelectionAreaBorder('bottom')?.scrollIntoView({
            //     block: 'nearest',
            //     inline: 'nearest',
            //     behavior: 'smooth',
            //   });
            // });
        }
        this.selection = newSelection;
    }
    startDrag(evt, cell, fillValues) {
        const groupKey = cell.groupKey;
        const table = this.tableContainer;
        const scrollContainer = table?.parentElement;
        if (!table || !scrollContainer) {
            return;
        }
        const tableRect = table.getBoundingClientRect();
        const startOffsetX = evt.x - tableRect.left;
        const startOffsetY = evt.y - tableRect.top;
        const offsetToSelection = this.cellPosition(groupKey);
        const select = (selection) => {
            this.selection = TableViewAreaSelection.create({
                groupKey: groupKey,
                rowsSelection: selection.row,
                columnsSelection: selection.column,
                focus: {
                    rowIndex: cell.rowIndex$.value,
                    columnIndex: cell.columnIndex$.value,
                },
                isEditing: false,
            });
        };
        const drag = startDrag(evt, {
            transform: evt => ({
                x: evt.x,
                y: evt.y,
            }),
            onDrag: () => {
                if (fillValues)
                    this.__dragToFillElement.dragging = true;
                return undefined;
            },
            onMove: ({ x, y }) => {
                if (!table)
                    return;
                const tableRect = table.getBoundingClientRect();
                const startX = tableRect.left + startOffsetX;
                const startY = tableRect.top + startOffsetY;
                const selection = offsetToSelection?.(startX, x, startY, y);
                if (!selection) {
                    return;
                }
                if (fillValues)
                    selection.column = {
                        start: cell.columnIndex$.value,
                        end: cell.columnIndex$.value,
                    };
                select(selection);
                return selection;
            },
            onDrop: selection => {
                if (!selection) {
                    return;
                }
                select(selection);
                if (fillValues && this.selection) {
                    this.__dragToFillElement.dragging = false;
                    fillSelectionWithFocusCellData(this.logic, TableViewAreaSelection.create({
                        groupKey: groupKey,
                        rowsSelection: selection.row,
                        columnsSelection: selection.column,
                        focus: {
                            rowIndex: cell.rowIndex$.value,
                            columnIndex: cell.columnIndex$.value,
                        },
                        isEditing: false,
                    }));
                }
            },
            onClear: () => {
                cancelScroll();
            },
        });
        const cancelScroll = autoScrollOnBoundary(scrollContainer, computed(() => {
            return {
                left: drag.mousePosition.value.x,
                right: drag.mousePosition.value.x,
                top: drag.mousePosition.value.y,
                bottom: drag.mousePosition.value.y,
            };
        }), {
            onScroll() {
                drag.move({ x: drag.last.x, y: drag.last.y });
            },
        });
    }
    toggleRow(rowId, groupKey) {
        const row = {
            id: rowId,
            groupKey,
        };
        const isSelected = TableViewRowSelection.includes(this.selection, row);
        this.rowSelectionChange({
            add: isSelected ? [] : [row],
            remove: isSelected ? [row] : [],
        });
    }
}
let SelectionElement = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _controller_decorators;
    let _controller_initializers = [];
    let _controller_extraInitializers = [];
    return class SelectionElement extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _controller_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _controller_decorators, { kind: "accessor", name: "controller", static: false, private: false, access: { has: obj => "controller" in obj, get: obj => obj.controller, set: (obj, value) => { obj.controller = value; } }, metadata: _metadata }, _controller_initializers, _controller_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    data-view-virtual-table-selection {
      display: block;
      position: absolute;
      left: 0;
      top: 0;
    }
    .database-selection {
      position: absolute;
      z-index: 2;
      box-sizing: border-box;
      background-color: var(--affine-primary-color-04);
      pointer-events: none;
      display: none;
    }

    .database-focus {
      position: absolute;
      z-index: 2;
      box-sizing: border-box;
      border: 1px solid var(--affine-primary-color);
      border-radius: 2px;
      pointer-events: none;
      outline: none;
      display: none;
    }
  `; }
        get virtualScroll() {
            return this.controller.virtualScroll;
        }
        get selection$() {
            return this.controller.logic.selection$;
        }
        render() {
            const focus = this.focusPosition$.value;
            const focusStyle = focus
                ? styleMap({
                    left: `${focus.left}px`,
                    top: `${focus.top}px`,
                    width: `${focus.width}px`,
                    height: `${focus.height}px`,
                    display: 'block',
                    boxShadow: focus.editing
                        ? '0px 0px 0px 2px rgba(30, 150, 235, 0.30)'
                        : 'unset',
                })
                : undefined;
            const area = this.areaPosition$.value;
            const areaStyle = area
                ? styleMap({
                    left: `${area.left}px`,
                    top: `${area.top}px`,
                    width: `${area.width}px`,
                    height: `${area.height}px`,
                    display: 'block',
                })
                : undefined;
            return html `
      <div class="database-selection" style=${areaStyle}></div>
      <div tabindex="0" class="database-focus" style=${focusStyle}></div>
    `;
        }
        #controller_accessor_storage;
        get controller() { return this.#controller_accessor_storage; }
        set controller(value) { this.#controller_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.focusPosition$ = computed(() => {
                const selection = this.selection$.value;
                if (selection?.selectionType !== 'area') {
                    return;
                }
                const focus = selection.focus;
                const groupKey = selection.groupKey;
                const group = this.controller.getGroup(groupKey);
                if (!group) {
                    return;
                }
                const row = group.rows$.value[focus.rowIndex];
                if (!row) {
                    return;
                }
                const columnPosition = this.controller.columnPositions$.value[focus.columnIndex];
                if (!columnPosition) {
                    return;
                }
                const left = columnPosition.left;
                const top = row.top$.value;
                const width = columnPosition.width;
                const height = row.height$.value;
                if (left == null || top == null || width == null || height == null) {
                    return;
                }
                const paddingLeft = this.controller.logic.root.config.virtualPadding$.value;
                return {
                    left: left + paddingLeft,
                    top,
                    width,
                    height,
                    editing: selection.isEditing,
                };
            });
            this.areaPosition$ = computed(() => {
                const selection = this.selection$.value;
                if (selection?.selectionType !== 'area') {
                    return;
                }
                const groupKey = selection.groupKey;
                const group = this.controller.getGroup(groupKey);
                if (!group) {
                    return;
                }
                const rect = this.controller.getRect(groupKey, selection.rowsSelection.start, selection.rowsSelection.end, selection.columnsSelection.start, selection.columnsSelection.end);
                if (!rect) {
                    return;
                }
                const paddingLeft = this.controller.logic.root.config.virtualPadding$.value;
                return {
                    left: rect.left + paddingLeft,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                };
            });
            this.#controller_accessor_storage = __runInitializers(this, _controller_initializers, void 0);
            __runInitializers(this, _controller_extraInitializers);
        }
    };
})();
export { SelectionElement };
