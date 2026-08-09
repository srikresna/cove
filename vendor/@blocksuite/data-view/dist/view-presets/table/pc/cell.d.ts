import { ShadowlessElement } from '@blocksuite/std';
import type { DataViewCellLifeCycle } from '../../../core/property/index.js';
import { type TableViewSelectionWithType } from '../selection';
import type { TableProperty } from '../table-view-manager.js';
import type { TableViewUILogic } from './table-view-ui-logic.js';
declare const TableViewCellContainer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableViewCellContainer extends TableViewCellContainer_base {
    static styles: import("lit").CSSResult;
    private readonly _cell$;
    accessor column: TableProperty;
    accessor rowId: string;
    private _tagDraft;
    setTagDraft(value: string): void;
    consumeTagDraft(): string | undefined;
    cell$: import("@preact/signals-core").ReadonlySignal<import("../../../index.js").Cell<unknown, unknown, Record<string, unknown>>>;
    selectCurrentCell: (editing: boolean) => void;
    get cell(): DataViewCellLifeCycle | undefined;
    private get groupKey();
    private get selectionController();
    connectedCallback(): void;
    isSelected(selection: TableViewSelectionWithType): boolean | undefined;
    render(): import("lit-html").TemplateResult | undefined;
    accessor columnId: string;
    accessor columnIndex: number;
    isEditing$: import("@preact/signals-core").Signal<boolean>;
    accessor rowIndex: number;
    get view(): import("../table-view-manager.js").TableSingleView;
    accessor tableViewLogic: TableViewUILogic;
}
declare global {
    interface HTMLElementTagNameMap {
        'dv-table-view-cell-container': TableViewCellContainer;
    }
}
export {};
//# sourceMappingURL=cell.d.ts.map