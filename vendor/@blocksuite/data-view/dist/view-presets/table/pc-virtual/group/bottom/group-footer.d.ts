import { ShadowlessElement } from '@blocksuite/std';
import type { VirtualTableViewUILogic } from '../../table-view-ui-logic';
import type { TableGridGroup } from '../../types';
declare const TableGroupFooter_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableGroupFooter extends TableGroupFooter_base {
    accessor tableViewLogic: VirtualTableViewUILogic;
    accessor gridGroup: TableGridGroup;
    group$: import("@preact/signals-core").ReadonlySignal<import("../../../../..").Group<unknown, unknown, Record<string, unknown>> | undefined>;
    get selectionController(): import("../../controller/selection").TableSelectionController;
    get tableViewManager(): import("../../..").TableSingleView;
    connectedCallback(): void;
    private readonly clickAddRow;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'virtual-table-group-footer': TableGroupFooter;
    }
}
export {};
//# sourceMappingURL=group-footer.d.ts.map