import type { TableBlockModel, TableCell } from '@blocksuite/affine-model';
import { type ReadonlySignal } from '@preact/signals-core';
import type { TableAreaSelection } from './selection-schema';
export declare class TableDataManager {
    private readonly model;
    constructor(model: TableBlockModel);
    readonly readonly$: ReadonlySignal<boolean>;
    readonly ui: {
        columnIndicatorIndex$: import("@preact/signals-core").Signal<number | undefined>;
        rowIndicatorIndex$: import("@preact/signals-core").Signal<number | undefined>;
    };
    readonly hoverColumnIndex$: import("@preact/signals-core").Signal<number | undefined>;
    readonly hoverRowIndex$: import("@preact/signals-core").Signal<number | undefined>;
    readonly hoverDragHandleColumnId$: import("@preact/signals-core").Signal<string | undefined>;
    readonly widthAdjustColumnId$: import("@preact/signals-core").Signal<string | undefined>;
    readonly virtualColumnCount$: import("@preact/signals-core").Signal<number>;
    readonly virtualRowCount$: import("@preact/signals-core").Signal<number>;
    readonly virtualWidth$: import("@preact/signals-core").Signal<{
        columnId: string;
        width: number;
    } | undefined>;
    readonly cellCountTips$: ReadonlySignal<string>;
    readonly rows$: ReadonlySignal<import("@blocksuite/affine-model").TableRow[]>;
    readonly columns$: ReadonlySignal<import("@blocksuite/affine-model").TableColumn[]>;
    readonly uiRows$: ReadonlySignal<(import("@blocksuite/affine-model").TableRow | {
        rowId: string;
        backgroundColor: undefined;
    })[]>;
    readonly uiColumns$: ReadonlySignal<(import("@blocksuite/affine-model").TableColumn | {
        columnId: string;
        backgroundColor: undefined;
        width: undefined;
    })[]>;
    getCell(rowId: string, columnId: string): TableCell | undefined;
    addRow(after?: number): string;
    addNRow(count: number): void;
    addNColumn(count: number): void;
    private getOrder;
    addColumn(after?: number): string;
    deleteRow(rowId: string): void;
    deleteColumn(columnId: string): void;
    updateRowOrder(rowId: string, newOrder: string): void;
    updateColumnOrder(columnId: string, newOrder: string): void;
    setRowBackgroundColor(rowId: string, color?: string): void;
    setColumnBackgroundColor(columnId: string, color?: string): void;
    setColumnWidth(columnId: string, width: number): void;
    clearRow(rowId: string): void;
    clearColumn(columnId: string): void;
    clearCellsBySelection(selection: TableAreaSelection): void;
    clearCells(cells: {
        rowId: string;
        columnId: string;
    }[]): void;
    insertColumn(after?: number): void;
    insertRow(after?: number): void;
    moveColumn(from: number, after?: number): void;
    moveRow(from: number, after?: number): void;
    duplicateColumn(index: number): string | undefined;
    duplicateRow(index: number): string | undefined;
}
//# sourceMappingURL=table-data-manager.d.ts.map