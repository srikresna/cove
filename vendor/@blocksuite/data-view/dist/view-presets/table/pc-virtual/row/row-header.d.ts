import { ShadowlessElement } from '@blocksuite/std';
import { nothing } from 'lit';
import type { VirtualTableViewUILogic } from '../table-view-ui-logic.js';
import type { TableGridCell } from '../types.js';
declare const TableRowHeader_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableRowHeader extends TableRowHeader_base {
    get view(): import("../../table-view-manager.js").TableSingleView;
    connectedCallback(): void;
    private readonly selectRow;
    get selectionController(): import("../controller/selection.js").TableSelectionController;
    get rowSelected$(): import("@preact/signals-core").ReadonlySignal<boolean>;
    renderDragHandle: () => import("lit-html").TemplateResult;
    get rowHover$(): import("@preact/signals-core").ReadonlySignal<boolean>;
    showCheckbox$: import("@preact/signals-core").ReadonlySignal<boolean>;
    renderCheckbox: () => import("lit-html").TemplateResult;
    protected render(): import("lit-html").TemplateResult | typeof nothing;
    get rowId(): string;
    get groupKey(): string;
    accessor gridCell: TableGridCell;
    accessor tableViewLogic: VirtualTableViewUILogic;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-table-row-header': TableRowHeader;
    }
}
export {};
//# sourceMappingURL=row-header.d.ts.map