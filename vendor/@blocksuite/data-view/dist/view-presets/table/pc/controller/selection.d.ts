import { ShadowlessElement } from '@blocksuite/std';
import type { ReactiveController } from 'lit';
import type { Ref } from 'lit/directives/ref.js';
import { type CellFocus, type MultiSelection, RowWithGroup, TableViewAreaSelection, type TableViewSelection, type TableViewSelectionWithType } from '../../selection';
import type { TableViewCellContainer } from '../cell.js';
import type { TableRowView } from '../row/row.js';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
import { DragToFillElement } from './drag-to-fill.js';
export declare class TableSelectionController implements ReactiveController {
    logic: TableViewUILogic;
    private _tableViewSelection?;
    private readonly getFocusCellContainer;
    __dragToFillElement: DragToFillElement;
    __selectionElement: SelectionElement;
    selectionStyleUpdateTask: number;
    private get areaSelectionElement();
    get dragToFillDraggable(): HTMLDivElement | undefined;
    private get focusSelectionElement();
    get selection(): TableViewSelectionWithType | undefined;
    set selection(data: TableViewSelection | undefined);
    get tableContainer(): HTMLDivElement | undefined;
    get view(): import("../../table-view-manager.js").TableSingleView;
    get viewData(): import("../../table-view-manager.js").TableSingleView;
    constructor(logic: TableViewUILogic);
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
    cellPosition(groupKey: string | undefined): (x1: number, x2: number, y1: number, y2: number) => {
        row: {
            start: number;
            end: number;
        };
        column: {
            start: number;
            end: number;
        };
    };
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
    getCellContainer(groupKey: string | undefined, rowIndex: number, columnIndex: number): TableViewCellContainer | undefined;
    getGroup(groupKey: string | undefined): Element | null;
    getRect(groupKey: string | undefined, top: number, bottom: number, left: number, right: number): undefined | {
        top: number;
        left: number;
        width: number;
        height: number;
        scale: number;
    };
    getRow(groupKey: string | undefined, rowId: string): Element | null | undefined;
    getSelectionAreaBorder(position: 'left' | 'right' | 'top' | 'bottom'): Element | null | undefined;
    hostConnected(): void;
    insertRowAfter(groupKey: string | undefined, rowId: string): void;
    insertRowBefore(groupKey: string | undefined, rowId: string): void;
    isRowSelection(): boolean;
    isValidSelection(selection?: TableViewSelectionWithType): boolean;
    navigateRowSelection(direction: 'up' | 'down', append?: boolean): void;
    rows(groupKey: string | undefined): NodeListOf<TableRowView> | undefined;
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
    startDrag(evt: PointerEvent, cell: TableViewCellContainer, fillValues?: boolean): void;
    toggleRow(rowId: string, groupKey?: string): void;
}
declare const SelectionElement_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class SelectionElement extends SelectionElement_base {
    static styles: import("lit").CSSResult;
    focusRef: Ref<HTMLDivElement>;
    preTask: number;
    selectionRef: Ref<HTMLDivElement>;
    get selection$(): import("@preact/signals-core").ReadonlySignal<({
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
    clearAreaStyle(): void;
    clearFocusStyle(): void;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    cancelSelectionUpdate(): void;
    startUpdate(selection?: TableViewSelection): void;
    updateAreaSelectionStyle(groupKey: string | undefined, rowSelection: MultiSelection, columnSelection: MultiSelection): void;
    updateFocusSelectionStyle(groupKey: string | undefined, focus: CellFocus, isEditing: boolean, showDragToFillHandle?: boolean): void;
    accessor controller: TableSelectionController;
}
export {};
//# sourceMappingURL=selection.d.ts.map