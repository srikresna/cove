import { ShadowlessElement } from '@blocksuite/std';
import type { DataViewCellLifeCycle } from '../../../../core/property';
import { type TableViewSelectionWithType } from '../../selection';
import type { VirtualTableViewUILogic } from '../table-view-ui-logic';
import type { TableGridCell } from '../types';
declare const DatabaseCellContainer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DatabaseCellContainer extends DatabaseCellContainer_base {
    static styles: import("lit").CSSResult;
    private readonly _cell;
    cell$: import("@preact/signals-core").ReadonlySignal<import("../../../..").Cell<unknown, unknown, Record<string, unknown>>>;
    selectCurrentCell: (editing: boolean) => void;
    get cell(): DataViewCellLifeCycle | undefined;
    private get selectionView();
    get rowSelected$(): import("@preact/signals-core").ReadonlySignal<boolean>;
    contextMenu: (e: MouseEvent) => void;
    connectedCallback(): void;
    isRowSelected$: import("@preact/signals-core").ReadonlySignal<boolean>;
    isSelected(selection: TableViewSelectionWithType): boolean;
    render(): import("lit-html").TemplateResult | undefined;
    private _tagDraft;
    setTagDraft(value: string): void;
    consumeTagDraft(): string | undefined;
    isEditing$: import("@preact/signals-core").Signal<boolean>;
    rowIndex$: import("@preact/signals-core").ReadonlySignal<number>;
    columnIndex$: import("@preact/signals-core").ReadonlySignal<number>;
    column$: import("@preact/signals-core").ReadonlySignal<import("../..").TableProperty | undefined>;
    get rowId(): string;
    get columnId(): string;
    get groupKey(): string;
    accessor gridCell: TableGridCell;
    accessor tableViewLogic: VirtualTableViewUILogic;
    get view(): import("../..").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-virtual-cell-container': DatabaseCellContainer;
    }
}
export {};
//# sourceMappingURL=cell.d.ts.map