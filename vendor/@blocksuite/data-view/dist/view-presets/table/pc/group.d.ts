import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../core/group-by/trait.js';
import type { Row } from '../../../core/index.js';
import type { TableViewUILogic } from './table-view-ui-logic.js';
declare const TableGroup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class TableGroup extends TableGroup_base {
    static styles: import("lit").CSSResult;
    collapsed$: import("@preact/signals-core").Signal<boolean>;
    private storageLoaded;
    private _loadCollapsedState;
    private readonly _toggleCollapse;
    private readonly clickAddRow;
    private readonly clickAddRowInStart;
    private readonly clickGroupOptions;
    private readonly renderGroupHeader;
    accessor group: Group | undefined;
    dndContext: import("../../../core/utils/wc-dnd/dnd-context.js").DndContext;
    showIndicator: () => void;
    get rows(): Row[];
    private renderRows;
    willUpdate(changed: Map<PropertyKey, unknown>): void;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor rowsContainer: HTMLElement | null;
    accessor tableViewLogic: TableViewUILogic;
    get view(): import("../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-table-group': TableGroup;
    }
}
export {};
//# sourceMappingURL=group.d.ts.map