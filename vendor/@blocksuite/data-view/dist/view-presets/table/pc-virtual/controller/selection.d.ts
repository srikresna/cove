import { DisposableGroup } from '@blocksuite/global/disposable';
import { ShadowlessElement } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
import type { ReactiveController } from 'lit';
import { RowWithGroup, TableViewAreaSelection, type TableViewSelection, type TableViewSelectionWithType } from '../../selection';
import type { DatabaseCellContainer } from '../row/cell';
import type { VirtualTableViewUILogic } from '../table-view-ui-logic.js';
import type { TableGridCell } from '../types.js';
import { DragToFillElement } from './drag-to-fill.js';
export declare class TableSelectionController implements ReactiveController {
    logic: VirtualTableViewUILogic;
    disposables: DisposableGroup;
    private _tableViewSelection?;
    private readonly getFocusCellContainer;
    __dragToFillElement: DragToFillElement;
    __selectionElement: SelectionElement;
    selectionStyleUpdateTask: number;
    get dragToFillDraggable(): HTMLDivElement | undefined;
    get selection(): TableViewSelectionWithType | undefined;
    set selection(data: TableViewSelection | undefined);
    get tableContainer(): HTMLElement | null | undefined;
    get view(): import("../../table-view-manager.js").TableSingleView;
    constructor(logic: VirtualTableViewUILogic);
    get host(): import("../table-view-ui-logic.js").TableViewUI | undefined;
    private clearSelection;
    private handleDragEvent;
    private handleSelectionChange;
    private insertTo;
    private resolveDragStartTarget;
    private scrollToAreaSelection;
    private scrollToFocus;
    areaToRows(selection: TableViewAreaSelection): {
        id: string;
        groupKey: string | undefined;
    }[];
    readonly columnPositions$: ReadonlySignal<{
        left: number;
        right: number;
        width: number;
    }[]>;
    readonly columnOffsets$: ReadonlySignal<number[]>;
    readonly groupRowOffsets$: ReadonlySignal<Record<string, ReadonlySignal<number[]>>>;
    cellPosition(groupKey: string | undefined): ((x1: number, x2: number, y1: number, y2: number) => {
        row: {
            start: number;
            end: number;
        };
        column: {
            start: number;
            end: number;
        };
    } | undefined) | undefined;
    clear(): void;
    deleteRow(rowId: string): void;
    focusFirstCell(): void;
    focusToArea(selection: TableViewAreaSelection): {
        rowsSelection: {
            start: number;
            end: number;
        };
        columnsSelection: {
            start: number;
            end: number;
        };
        isEditing: false;
        focus: {
            rowIndex: number;
            columnIndex: number;
        };
        selectionType: "area";
        groupKey?: string | undefined;
    };
    focusToCell(position: 'left' | 'right' | 'up' | 'down'): void;
    getCellElement(cell: TableGridCell): DatabaseCellContainer | undefined;
    getCellByIndex(groupKey: string | undefined, rowIndex: number, columnIndex: number): TableGridCell | undefined;
    getCellContainer(groupKey: string | undefined, rowIndex: number, columnIndex: number): DatabaseCellContainer | undefined;
    getRect(groupKey: string | undefined, topIndex: number, bottomIndex: number, leftIndex: number, rightIndex: number): undefined | {
        top: number;
        left: number;
        width: number;
        height: number;
        scale: number;
    };
    getSelectionAreaBorder(position: 'left' | 'right' | 'top' | 'bottom'): Element | null;
    hostConnected(): void;
    insertRowAfter(groupKey: string | undefined, rowId: string): void;
    insertRowBefore(groupKey: string | undefined, rowId: string): void;
    isRowSelection(): boolean;
    isValidSelection(selection?: TableViewSelectionWithType): boolean;
    navigateRowSelection(direction: 'up' | 'down', append?: boolean): void;
    get virtualScroll(): import("../types.js").TableGrid | undefined;
    getGroup(groupKey: string | undefined): import("../virtual/virtual-scroll.js").GridGroup<import("../types.js").TableGroupData, import("../types.js").TableRowData, import("../types.js").TableCellData> | undefined;
    getRow(groupKey: string | undefined, rowId: string): import("../virtual/virtual-scroll.js").GridRow<import("../types.js").TableGroupData, import("../types.js").TableRowData, import("../types.js").TableCellData> | undefined;
    getCell(groupKey: string | undefined, rowId: string, columnId: string): import("../virtual/virtual-scroll.js").GridCell<import("../types.js").TableGroupData, import("../types.js").TableRowData, import("../types.js").TableCellData> | undefined;
    rows(groupKey: string | undefined): import("../virtual/virtual-scroll.js").GridRow<import("../types.js").TableGroupData, import("../types.js").TableRowData, import("../types.js").TableCellData>[] | undefined;
    rowSelectionChange({ add, remove, }: {
        add: RowWithGroup[];
        remove: RowWithGroup[];
    }): void;
    rowsToArea(rows: string[]): {
        start: number;
        end: number;
        groupKey?: string;
    } | undefined;
    selectionAreaDown(): void;
    selectionAreaLeft(): void;
    selectionAreaRight(): void;
    selectionAreaUp(): void;
    startDrag(evt: PointerEvent, cell: DatabaseCellContainer, fillValues?: boolean): void;
    toggleRow(rowId: string, groupKey?: string): void;
}
declare const SelectionElement_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class SelectionElement extends SelectionElement_base {
    static styles: import("lit").CSSResult;
    get virtualScroll(): import("../types.js").TableGrid | undefined;
    focusPosition$: ReadonlySignal<{
        left: number;
        top: number;
        width: number;
        height: number;
        editing: boolean;
    } | undefined>;
    areaPosition$: ReadonlySignal<{
        left: number;
        top: number;
        width: number;
        height: number;
    } | undefined>;
    get selection$(): ReadonlySignal<({
        type: "table";
        viewId: string;
    } & {
        focus: {
            rowIndex: number;
            columnIndex: number;
        };
        selectionType: "area";
        rowsSelection: {
            start: number;
            end: number;
        };
        columnsSelection: {
            start: number;
            end: number;
        };
        isEditing: boolean;
        groupKey?: string | undefined;
    }) | ({
        type: "table";
        viewId: string;
    } & {
        selectionType: "row";
        rows: {
            id: string;
            groupKey?: string | undefined;
        }[];
    }) | undefined>;
    render(): import("lit-html").TemplateResult<1>;
    accessor controller: TableSelectionController;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-virtual-table-selection': SelectionElement;
    }
}
export {};
//# sourceMappingURL=selection.d.ts.map