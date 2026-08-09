import { ShadowlessElement } from '@blocksuite/std';
import type { VirtualTableViewUILogic } from '../table-view-ui-logic.js';
import type { TableGridCell } from '../types.js';
declare const TableRowLast_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableRowLast extends TableRowLast_base {
    get rowSelected$(): import("@preact/signals-core").ReadonlySignal<boolean>;
    connectedCallback(): void;
    protected render(): import("lit-html").TemplateResult;
    get rowId(): string;
    get groupKey(): string;
    accessor gridCell: TableGridCell;
    accessor tableViewLogic: VirtualTableViewUILogic;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-table-row-last': TableRowLast;
    }
}
export {};
//# sourceMappingURL=row-last.d.ts.map