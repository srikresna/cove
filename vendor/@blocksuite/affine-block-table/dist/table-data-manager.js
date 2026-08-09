import { generateFractionalIndexingKeyBetween } from '@blocksuite/affine-shared/utils';
import { nanoid, Text } from '@blocksuite/store';
import { computed, signal } from '@preact/signals-core';
import { compareByOrder } from './utils';
export class TableDataManager {
    constructor(model) {
        this.model = model;
        this.readonly$ = computed(() => {
            return this.model.store.readonly;
        });
        this.ui = {
            columnIndicatorIndex$: signal(),
            rowIndicatorIndex$: signal(),
        };
        this.hoverColumnIndex$ = signal();
        this.hoverRowIndex$ = signal();
        this.hoverDragHandleColumnId$ = signal();
        this.widthAdjustColumnId$ = signal();
        this.virtualColumnCount$ = signal(0);
        this.virtualRowCount$ = signal(0);
        this.virtualWidth$ = signal();
        this.cellCountTips$ = computed(() => `${this.virtualRowCount$.value + this.rows$.value.length} x ${this.virtualColumnCount$.value + this.columns$.value.length}`);
        this.rows$ = computed(() => {
            return Object.values(this.model.props.rows$.value).sort(compareByOrder);
        });
        this.columns$ = computed(() => {
            return Object.values(this.model.props.columns$.value).sort(compareByOrder);
        });
        this.uiRows$ = computed(() => {
            const virtualRowCount = this.virtualRowCount$.value;
            const rows = this.rows$.value;
            if (virtualRowCount === 0) {
                return rows;
            }
            if (virtualRowCount > 0) {
                return [
                    ...rows,
                    ...Array.from({ length: virtualRowCount }, (_, i) => ({
                        rowId: `${i}`,
                        backgroundColor: undefined,
                    })),
                ];
            }
            return rows.slice(0, rows.length + virtualRowCount);
        });
        this.uiColumns$ = computed(() => {
            const virtualColumnCount = this.virtualColumnCount$.value;
            const columns = this.columns$.value;
            if (virtualColumnCount === 0) {
                return columns;
            }
            if (virtualColumnCount > 0) {
                return [
                    ...columns,
                    ...Array.from({ length: virtualColumnCount }, (_, i) => ({
                        columnId: `${i}`,
                        backgroundColor: undefined,
                        width: undefined,
                    })),
                ];
            }
            return columns.slice(0, columns.length + virtualColumnCount);
        });
    }
    getCell(rowId, columnId) {
        return this.model.props.cells$.value[`${rowId}:${columnId}`];
    }
    addRow(after) {
        const order = this.getOrder(this.rows$.value, after);
        const rowId = nanoid();
        this.model.store.transact(() => {
            this.model.props.rows[rowId] = {
                rowId,
                order,
            };
            this.columns$.value.forEach(column => {
                this.model.props.cells[`${rowId}:${column.columnId}`] = {
                    text: new Text(),
                };
            });
        });
        return rowId;
    }
    addNRow(count) {
        if (count === 0) {
            return;
        }
        if (count > 0) {
            this.model.store.transact(() => {
                for (let i = 0; i < count; i++) {
                    this.addRow(this.rows$.value.length - 1);
                }
            });
        }
        else {
            const rows = this.rows$.value;
            const rowCount = rows.length;
            this.model.store.transact(() => {
                rows.slice(rowCount + count, rowCount).forEach(row => {
                    this.deleteRow(row.rowId);
                });
            });
        }
    }
    addNColumn(count) {
        if (count === 0) {
            return;
        }
        if (count > 0) {
            this.model.store.transact(() => {
                for (let i = 0; i < count; i++) {
                    this.addColumn(this.columns$.value.length - 1);
                }
            });
        }
        else {
            const columns = this.columns$.value;
            const columnCount = columns.length;
            this.model.store.transact(() => {
                columns.slice(columnCount + count, columnCount).forEach(column => {
                    this.deleteColumn(column.columnId);
                });
            });
        }
    }
    getOrder(array, after) {
        after = after != null ? (after < 0 ? undefined : after) : undefined;
        const prevOrder = after == null ? null : array[after]?.order;
        const nextOrder = after == null ? array[0]?.order : array[after + 1]?.order;
        const order = generateFractionalIndexingKeyBetween(prevOrder ?? null, nextOrder ?? null);
        return order;
    }
    addColumn(after) {
        const order = this.getOrder(this.columns$.value, after);
        const columnId = nanoid();
        this.model.store.transact(() => {
            this.model.props.columns[columnId] = {
                columnId,
                order,
            };
            this.rows$.value.forEach(row => {
                this.model.props.cells[`${row.rowId}:${columnId}`] = {
                    text: new Text(),
                };
            });
        });
        return columnId;
    }
    deleteRow(rowId) {
        this.model.store.transact(() => {
            Object.keys(this.model.props.rows).forEach(id => {
                if (id === rowId) {
                    delete this.model.props.rows[id];
                }
            });
            Object.keys(this.model.props.cells).forEach(id => {
                if (id.startsWith(rowId)) {
                    delete this.model.props.cells[id];
                }
            });
        });
    }
    deleteColumn(columnId) {
        this.model.store.transact(() => {
            Object.keys(this.model.props.columns).forEach(id => {
                if (id === columnId) {
                    delete this.model.props.columns[id];
                }
            });
            Object.keys(this.model.props.cells).forEach(id => {
                if (id.endsWith(`:${columnId}`)) {
                    delete this.model.props.cells[id];
                }
            });
        });
    }
    updateRowOrder(rowId, newOrder) {
        this.model.store.transact(() => {
            if (this.model.props.rows[rowId]) {
                this.model.props.rows[rowId].order = newOrder;
            }
        });
    }
    updateColumnOrder(columnId, newOrder) {
        this.model.store.transact(() => {
            if (this.model.props.columns[columnId]) {
                this.model.props.columns[columnId].order = newOrder;
            }
        });
    }
    setRowBackgroundColor(rowId, color) {
        this.model.store.transact(() => {
            if (this.model.props.rows[rowId]) {
                this.model.props.rows[rowId].backgroundColor = color;
            }
        });
    }
    setColumnBackgroundColor(columnId, color) {
        this.model.store.transact(() => {
            if (this.model.props.columns[columnId]) {
                this.model.props.columns[columnId].backgroundColor = color;
            }
        });
    }
    setColumnWidth(columnId, width) {
        this.model.store.transact(() => {
            if (this.model.props.columns[columnId]) {
                this.model.props.columns[columnId].width = width;
            }
        });
    }
    clearRow(rowId) {
        this.model.store.transact(() => {
            Object.keys(this.model.props.cells).forEach(id => {
                if (id.startsWith(rowId)) {
                    this.model.props.cells[id]?.text.replace(0, this.model.props.cells[id]?.text.length, '');
                }
            });
        });
    }
    clearColumn(columnId) {
        this.model.store.transact(() => {
            Object.keys(this.model.props.cells).forEach(id => {
                if (id.endsWith(`:${columnId}`)) {
                    this.model.props.cells[id]?.text.replace(0, this.model.props.cells[id]?.text.length, '');
                }
            });
        });
    }
    clearCellsBySelection(selection) {
        const columns = this.uiColumns$.value;
        const rows = this.uiRows$.value;
        const deleteCells = [];
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
                deleteCells.push({ rowId: row.rowId, columnId: column.columnId });
            }
        }
        this.clearCells(deleteCells);
    }
    clearCells(cells) {
        this.model.store.transact(() => {
            cells.forEach(({ rowId, columnId }) => {
                const text = this.model.props.cells[`${rowId}:${columnId}`]?.text;
                if (text) {
                    text.replace(0, text.length, '');
                }
            });
        });
    }
    insertColumn(after) {
        this.addColumn(after);
    }
    insertRow(after) {
        this.addRow(after);
    }
    moveColumn(from, after) {
        const columns = this.columns$.value;
        const column = columns[from];
        if (!column)
            return;
        const order = this.getOrder(columns, after);
        this.model.store.transact(() => {
            const realColumn = this.model.props.columns[column.columnId];
            if (realColumn) {
                realColumn.order = order;
            }
        });
    }
    moveRow(from, after) {
        const rows = this.rows$.value;
        const row = rows[from];
        if (!row)
            return;
        const order = this.getOrder(rows, after);
        this.model.store.transact(() => {
            const realRow = this.model.props.rows[row.rowId];
            if (realRow) {
                realRow.order = order;
            }
        });
    }
    duplicateColumn(index) {
        const oldColumn = this.columns$.value[index];
        if (!oldColumn)
            return;
        const order = this.getOrder(this.columns$.value, index);
        const newColumnId = nanoid();
        this.model.store.transact(() => {
            this.model.props.columns[newColumnId] = {
                ...oldColumn,
                columnId: newColumnId,
                order,
            };
            this.rows$.value.forEach(row => {
                this.model.props.cells[`${row.rowId}:${newColumnId}`] = {
                    text: this.model.props.cells[`${row.rowId}:${oldColumn.columnId}`]?.text.clone() ?? new Text(),
                };
            });
        });
        return newColumnId;
    }
    duplicateRow(index) {
        const oldRow = this.rows$.value[index];
        if (!oldRow)
            return;
        const order = this.getOrder(this.rows$.value, index);
        const newRowId = nanoid();
        this.model.store.transact(() => {
            this.model.props.rows[newRowId] = {
                ...oldRow,
                rowId: newRowId,
                order,
            };
            this.columns$.value.forEach(column => {
                this.model.props.cells[`${newRowId}:${column.columnId}`] = {
                    text: this.model.props.cells[`${oldRow.rowId}:${column.columnId}`]?.text.clone() ?? new Text(),
                };
            });
        });
        return newRowId;
    }
}
