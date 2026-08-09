import { ShadowlessElement } from '@blocksuite/std';
import type { VirtualTableViewUILogic } from '../../table-view-ui-logic';
import type { TableGridGroup } from '../../types';
declare const TableGroupHeader_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableGroupHeader extends TableGroupHeader_base {
    accessor tableViewLogic: VirtualTableViewUILogic;
    accessor gridGroup: TableGridGroup;
    connectedCallback(): void;
    group$: import("@preact/signals-core").ReadonlySignal<import("../../../../..").Group<unknown, unknown, Record<string, unknown>> | undefined>;
    groupKey$: import("@preact/signals-core").ReadonlySignal<string | undefined>;
    get tableViewManager(): import("../../..").TableSingleView;
    get selectionController(): import("../../controller/selection").TableSelectionController;
    private readonly clickAddRowInStart;
    private readonly clickGroupOptions;
    private readonly renderGroupHeader;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'virtual-table-group-header': TableGroupHeader;
    }
}
export {};
//# sourceMappingURL=group-header.d.ts.map