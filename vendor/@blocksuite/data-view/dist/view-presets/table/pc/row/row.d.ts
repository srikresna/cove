import { ShadowlessElement } from '@blocksuite/std';
import { type TableViewSelection } from '../../selection';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
declare const TableRowView_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableRowView extends TableRowView_base {
    static styles: import("lit").CSSResult;
    private readonly _clickDragHandler;
    contextMenu: (e: MouseEvent) => void;
    setSelection: (selection?: TableViewSelection) => void;
    get groupKey(): string | undefined;
    get selectionController(): import("../controller/selection").TableSelectionController;
    connectedCallback(): void;
    protected render(): unknown;
    accessor tableViewLogic: TableViewUILogic;
    accessor rowId: string;
    accessor rowIndex: number;
    get view(): import("../..").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-table-row': TableRowView;
    }
}
export {};
//# sourceMappingURL=row.d.ts.map