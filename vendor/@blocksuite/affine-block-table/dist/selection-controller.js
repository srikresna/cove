import { domToOffsets, getAreaByOffsets, getTargetIndexByDraggingOffset, } from '@blocksuite/affine-shared/utils';
import { IS_MOBILE } from '@blocksuite/global/env';
import { computed } from '@preact/signals-core';
import { ColumnMinWidth, DefaultColumnWidth } from './consts';
import { TableSelection, TableSelectionData, } from './selection-schema';
import { createColumnDragPreview, createRowDragPreview, TableCellComponentName, } from './table-cell';
import { cleanSelection } from './utils';
const TEXT = 'text/plain';
export class SelectionController {
    constructor(host) {
        this.host = host;
        this.doCopyOrCut = (selection, isCut) => {
            const columns = this.dataManager.uiColumns$.value;
            const rows = this.dataManager.uiRows$.value;
            const cells = [];
            const deleteCells = [];
            for (let i = selection.rowStartIndex; i <= selection.rowEndIndex; i++) {
                const row = rows[i];
                if (!row) {
                    continue;
                }
                const rowCells = [];
                for (let j = selection.columnStartIndex; j <= selection.columnEndIndex; j++) {
                    const column = columns[j];
                    if (!column) {
                        continue;
                    }
                    const cell = this.dataManager.getCell(row.rowId, column.columnId);
                    rowCells.push(cell?.text.toString() ?? '');
                    if (isCut) {
                        deleteCells.push({ rowId: row.rowId, columnId: column.columnId });
                    }
                }
                cells.push(rowCells);
            }
            if (isCut) {
                this.dataManager.clearCells(deleteCells);
            }
            const text = cells.map(row => row.join('\t')).join('\n');
            const htmlTable = `<table style="border-collapse: collapse;">
      <tbody>
        ${cells
                .map(row => `
          <tr>
            ${row
                .map(cell => `
              <td style="border: 1px solid var(--affine-border-color); padding: 8px 12px; min-width: ${DefaultColumnWidth}px; min-height: 22px;">${cell}</td>
            `)
                .join('')}
          </tr>
        `)
                .join('')}
      </tbody>
    </table>`;
            this.clipboard
                .writeToClipboard(items => ({
                ...items,
                [TEXT]: text,
                'text/html': htmlTable,
            }))
                .catch(console.error);
        };
        this.onCopy = () => {
            const selection = this.getSelected();
            if (!selection || selection.type !== 'area') {
                return false;
            }
            this.doCopyOrCut(selection, false);
            return true;
        };
        this.onCut = () => {
            const selection = this.getSelected();
            if (!selection || selection.type !== 'area') {
                return false;
            }
            this.doCopyOrCut(selection, true);
            return true;
        };
        this.doPaste = (plainText, selection) => {
            try {
                const rowTextLists = plainText
                    .split(/\r?\n/)
                    .map(line => line.split('\t').map(cell => cell.trim()))
                    .filter(row => row.some(cell => cell !== '')); // Filter out empty rows
                const height = rowTextLists.length;
                const width = rowTextLists[0]?.length ?? 0;
                if (height > 0 && width > 0) {
                    const columns = this.dataManager.uiColumns$.value;
                    const rows = this.dataManager.uiRows$.value;
                    for (let i = selection.rowStartIndex; i <= selection.rowEndIndex; i++) {
                        const row = rows[i];
                        if (!row) {
                            continue;
                        }
                        for (let j = selection.columnStartIndex; j <= selection.columnEndIndex; j++) {
                            const column = columns[j];
                            if (!column) {
                                continue;
                            }
                            const text = this.dataManager.getCell(row.rowId, column.columnId)?.text;
                            if (text) {
                                const rowIndex = (i - selection.rowStartIndex) % height;
                                const columnIndex = (j - selection.columnStartIndex) % width;
                                text.replace(0, text.length, rowTextLists[rowIndex]?.[columnIndex] ?? '');
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        };
        this.onPaste = (_context) => {
            const event = _context.get('clipboardState').raw;
            event.stopPropagation();
            const clipboardData = event.clipboardData;
            if (!clipboardData)
                return false;
            const selection = this.getSelected();
            if (!selection || selection.type !== 'area') {
                return false;
            }
            try {
                const html = clipboardData.getData('text/html');
                if (html) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const table = doc.querySelector('table');
                    if (table) {
                        const rows = [];
                        table.querySelectorAll('tr').forEach(tr => {
                            const rowData = [];
                            tr.querySelectorAll('td,th').forEach(cell => {
                                rowData.push(cell.textContent?.trim() ?? '');
                            });
                            if (rowData.length > 0) {
                                rows.push(rowData);
                            }
                        });
                        if (rows.length > 0) {
                            this.doPaste(rows.map(row => row.join('\t')).join('\n'), selection);
                            return true;
                        }
                    }
                }
                // If no HTML format or parsing failed, try to read plain text
                const plainText = clipboardData.getData('text/plain');
                if (plainText) {
                    this.doPaste(plainText, selection);
                    return true;
                }
            }
            catch (error) {
                console.error('Failed to paste:', error);
            }
            return false;
        };
        this.selected$ = computed(() => this.getSelected());
        this.host.addController(this);
    }
    hostConnected() {
        this.dragListener();
        this.host.handleEvent('copy', this.onCopy);
        this.host.handleEvent('cut', this.onCut);
        this.host.handleEvent('paste', this.onPaste);
        this.host.handleEvent('dragStart', context => {
            if (IS_MOBILE || this.dataManager.readonly$.value)
                return false;
            const event = context.get('pointerState').raw;
            const target = event.target;
            if (target instanceof Element &&
                target.closest('[data-width-adjust-column-id], [data-drag-column-id], [data-drag-row-id]')) {
                event.preventDefault();
                event.stopPropagation();
                return true;
            }
            return false;
        });
    }
    get dataManager() {
        return this.host.dataManager;
    }
    get clipboard() {
        return this.host.std.clipboard;
    }
    get scale() {
        return this.host.getScale();
    }
    widthAdjust(dragHandle, event) {
        event.preventDefault();
        event.stopPropagation();
        const initialX = event.clientX;
        const currentWidth = dragHandle.closest('td')?.getBoundingClientRect().width ??
            DefaultColumnWidth;
        const adjustedWidth = currentWidth / this.scale;
        const columnId = dragHandle.dataset['widthAdjustColumnId'];
        if (!columnId) {
            return;
        }
        const onMove = (event) => {
            this.dataManager.widthAdjustColumnId$.value = columnId;
            this.dataManager.virtualWidth$.value = {
                columnId,
                width: Math.max(ColumnMinWidth, (event.clientX - initialX) / this.scale + adjustedWidth),
            };
        };
        const onUp = () => {
            const width = this.dataManager.virtualWidth$.value?.width;
            this.dataManager.widthAdjustColumnId$.value = undefined;
            this.dataManager.virtualWidth$.value = undefined;
            if (width) {
                this.dataManager.setColumnWidth(columnId, width);
            }
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }
    dragListener() {
        if (IS_MOBILE || this.dataManager.readonly$.value) {
            return;
        }
        this.host.disposables.addFromEvent(this.host, 'pointerdown', event => {
            const target = event.target;
            if (!(target instanceof HTMLElement))
                return;
            if (target.closest('[data-width-adjust-column-id], [data-drag-column-id], [data-drag-row-id]')) {
                event.stopPropagation();
            }
        });
        this.host.disposables.addFromEvent(this.host, 'mousedown', event => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            const widthAdjustColumn = target.closest('[data-width-adjust-column-id]');
            if (widthAdjustColumn instanceof HTMLElement) {
                this.widthAdjust(widthAdjustColumn, event);
                return;
            }
            const columnDragHandle = target.closest('[data-drag-column-id]');
            if (columnDragHandle instanceof HTMLElement) {
                this.columnDrag(columnDragHandle, event);
                return;
            }
            const rowDragHandle = target.closest('[data-drag-row-id]');
            if (rowDragHandle instanceof HTMLElement) {
                this.rowDrag(rowDragHandle, event);
                return;
            }
            this.onDragStart(event);
        });
    }
    startColumnDrag(x, columnDragHandle) {
        const columnId = columnDragHandle.dataset['dragColumnId'];
        if (!columnId) {
            return;
        }
        const cellRect = columnDragHandle.closest('td')?.getBoundingClientRect();
        const containerRect = this.host.getBoundingClientRect();
        if (!cellRect) {
            return;
        }
        const initialDiffX = x - cellRect.left;
        const cells = Array.from(this.host.querySelectorAll(`td[data-column-id="${columnId}"]`)).map(td => td.closest(TableCellComponentName));
        const firstCell = cells[0];
        if (!firstCell) {
            return;
        }
        const draggingIndex = firstCell.columnIndex;
        const columns = Array.from(this.host.querySelectorAll(`td[data-row-id="${firstCell?.row?.rowId}"]`)).map(td => td.getBoundingClientRect());
        const columnOffsets = columns.flatMap((column, index) => index === columns.length - 1 ? [column.left, column.right] : [column.left]);
        const columnDragPreview = createColumnDragPreview(cells);
        columnDragPreview.style.top = `${cellRect.top - containerRect.top - 0.5}px`;
        columnDragPreview.style.left = `${cellRect.left - containerRect.left}px`;
        columnDragPreview.style.width = `${cellRect.width}px`;
        this.host.append(columnDragPreview);
        document.body.style.pointerEvents = 'none';
        const onMove = (x) => {
            const { targetIndex, isForward } = getTargetIndexByDraggingOffset(columnOffsets, draggingIndex, x - initialDiffX);
            if (targetIndex != null) {
                this.dataManager.ui.columnIndicatorIndex$.value = isForward
                    ? targetIndex + 1
                    : targetIndex;
            }
            else {
                this.dataManager.ui.columnIndicatorIndex$.value = undefined;
            }
            columnDragPreview.style.left = `${x - initialDiffX - containerRect.left}px`;
        };
        const onEnd = () => {
            const targetIndex = this.dataManager.ui.columnIndicatorIndex$.value;
            this.dataManager.ui.columnIndicatorIndex$.value = undefined;
            document.body.style.pointerEvents = 'auto';
            columnDragPreview.remove();
            if (targetIndex != null) {
                this.dataManager.moveColumn(draggingIndex, targetIndex === 0 ? undefined : targetIndex - 1);
            }
        };
        return {
            onMove,
            onEnd,
        };
    }
    columnDrag(columnDragHandle, event) {
        let drag = undefined;
        const initialX = event.clientX;
        const onMove = (event) => {
            const diffX = event.clientX - initialX;
            if (!drag && Math.abs(diffX) > 10) {
                event.preventDefault();
                event.stopPropagation();
                cleanSelection();
                this.setSelected(undefined);
                drag = this.startColumnDrag(initialX, columnDragHandle);
            }
            drag?.onMove(event.clientX);
        };
        const onUp = () => {
            drag?.onEnd();
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }
    startRowDrag(y, rowDragHandle) {
        const rowId = rowDragHandle.dataset['dragRowId'];
        if (!rowId) {
            return;
        }
        const cellRect = rowDragHandle.closest('td')?.getBoundingClientRect();
        const containerRect = this.host.getBoundingClientRect();
        if (!cellRect) {
            return;
        }
        const initialDiffY = y - cellRect.top;
        const cells = Array.from(this.host.querySelectorAll(`td[data-row-id="${rowId}"]`)).map(td => td.closest(TableCellComponentName));
        const firstCell = cells[0];
        if (!firstCell) {
            return;
        }
        const draggingIndex = firstCell.rowIndex;
        const rows = Array.from(this.host.querySelectorAll(`td[data-column-id="${firstCell?.column?.columnId}"]`)).map(td => td.getBoundingClientRect());
        const rowOffsets = rows.flatMap((row, index) => index === rows.length - 1 ? [row.top, row.bottom] : [row.top]);
        const rowDragPreview = createRowDragPreview(cells);
        rowDragPreview.style.left = `${cellRect.left - containerRect.left}px`;
        rowDragPreview.style.top = `${cellRect.top - containerRect.top - 0.5}px`;
        rowDragPreview.style.height = `${cellRect.height}px`;
        this.host.append(rowDragPreview);
        document.body.style.pointerEvents = 'none';
        const onMove = (y) => {
            const { targetIndex, isForward } = getTargetIndexByDraggingOffset(rowOffsets, draggingIndex, y - initialDiffY);
            if (targetIndex != null) {
                this.dataManager.ui.rowIndicatorIndex$.value = isForward
                    ? targetIndex + 1
                    : targetIndex;
            }
            else {
                this.dataManager.ui.rowIndicatorIndex$.value = undefined;
            }
            rowDragPreview.style.top = `${y - initialDiffY - containerRect.top}px`;
        };
        const onEnd = () => {
            const targetIndex = this.dataManager.ui.rowIndicatorIndex$.value;
            this.dataManager.ui.rowIndicatorIndex$.value = undefined;
            document.body.style.pointerEvents = 'auto';
            rowDragPreview.remove();
            if (targetIndex != null) {
                this.dataManager.moveRow(draggingIndex, targetIndex === 0 ? undefined : targetIndex - 1);
            }
        };
        return {
            onMove,
            onEnd,
        };
    }
    rowDrag(rowDragHandle, event) {
        let drag = undefined;
        const initialY = event.clientY;
        const onMove = (event) => {
            const diffY = event.clientY - initialY;
            if (!drag && Math.abs(diffY) > 10) {
                event.preventDefault();
                event.stopPropagation();
                cleanSelection();
                this.setSelected(undefined);
                drag = this.startRowDrag(initialY, rowDragHandle);
            }
            drag?.onMove(event.clientY);
        };
        // oxlint-disable-next-line sonarjs/no-identical-functions
        const onUp = () => {
            drag?.onEnd();
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }
    onDragStart(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        const offsets = domToOffsets(this.host, 'tr', 'td');
        if (!offsets)
            return;
        const startX = event.clientX;
        const startY = event.clientY;
        let selected = false;
        const initCell = target.closest('affine-table-cell');
        if (!initCell) {
            selected = true;
        }
        const onMove = (event) => {
            const target = event.target;
            if (target instanceof HTMLElement) {
                const cell = target.closest('affine-table-cell');
                if (!selected && initCell === cell) {
                    return;
                }
                selected = true;
                const endX = event.clientX;
                const endY = event.clientY;
                const [left, right] = startX > endX ? [endX, startX] : [startX, endX];
                const [top, bottom] = startY > endY ? [endY, startY] : [startY, endY];
                const area = getAreaByOffsets(offsets, top, bottom, left, right);
                this.setSelected({
                    type: 'area',
                    rowStartIndex: area.top,
                    rowEndIndex: area.bottom,
                    columnStartIndex: area.left,
                    columnEndIndex: area.right,
                });
            }
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }
    setSelected(selection, removeNativeSelection = true) {
        if (selection) {
            if (this.hasExternalNativeSelection()) {
                return;
            }
            const previous = this.getSelected();
            if (TableSelectionData.equals(previous, selection)) {
                return;
            }
            if (removeNativeSelection) {
                getSelection()?.removeAllRanges();
            }
            this.host.selection.set([
                new TableSelection({
                    blockId: this.host.model.id,
                    data: selection,
                }),
            ]);
        }
        else {
            this.host.selection.clear();
        }
    }
    getSelected() {
        const selection = this.host.selection.value.find(selection => selection.blockId === this.host.model.id);
        return selection?.is(TableSelection) ? selection.data : undefined;
    }
    hasExternalNativeSelection() {
        const selection = getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            return false;
        }
        const range = selection.getRangeAt(0);
        if (!range.intersectsNode(this.host)) {
            return false;
        }
        const anchorNode = selection.anchorNode;
        const focusNode = selection.focusNode;
        return (!!anchorNode &&
            !!focusNode &&
            (!this.host.contains(anchorNode) || !this.host.contains(focusNode)));
    }
}
