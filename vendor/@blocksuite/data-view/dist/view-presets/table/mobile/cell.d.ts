import { ShadowlessElement } from '@blocksuite/std';
import { type DataViewCellLifeCycle } from '../../../core/index.js';
import type { TableProperty } from '../table-view-manager.js';
import type { MobileTableViewUILogic } from './table-view-ui-logic.js';
declare const MobileTableCell_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileTableCell extends MobileTableCell_base {
    static styles: import("lit").CSSResult;
    private readonly _cell;
    accessor column: TableProperty;
    accessor rowId: string;
    cell$: import("@preact/signals-core").ReadonlySignal<import("../../../index.js").Cell<unknown, unknown, Record<string, unknown>>>;
    isSelectionEditing$: import("@preact/signals-core").ReadonlySignal<boolean>;
    selectCurrentCell: (editing: boolean) => void;
    get cell(): DataViewCellLifeCycle | undefined;
    private get groupKey();
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult | undefined;
    accessor columnId: string;
    accessor columnIndex: number;
    isEditing$: import("@preact/signals-core").Signal<boolean>;
    accessor rowIndex: number;
    accessor tableViewLogic: MobileTableViewUILogic;
    get view(): import("../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-table-cell': MobileTableCell;
    }
}
export {};
//# sourceMappingURL=cell.d.ts.map