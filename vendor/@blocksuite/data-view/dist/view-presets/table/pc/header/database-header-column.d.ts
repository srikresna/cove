import { ShadowlessElement } from '@blocksuite/std';
import type { TableProperty } from '../../table-view-manager.js';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
declare const DatabaseHeaderColumn_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DatabaseHeaderColumn extends DatabaseHeaderColumn_base {
    static styles: import("lit").CSSResult;
    private readonly _clickColumn;
    private readonly _clickTypeIcon;
    private readonly _contextMenu;
    private readonly _enterWidthDragBar;
    private readonly _leaveWidthDragBar;
    private readonly drawWidthDragBar;
    private drawWidthDragBarTask;
    private readonly widthDragBar;
    editTitle: () => void;
    private get readonly();
    private _addFilter;
    private _addSort;
    private _toggleQuickSettingBar;
    private popMenu;
    private widthDragStart;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult;
    accessor column: TableProperty;
    accessor grabStatus: 'grabStart' | 'grabEnd' | 'grabbing';
    accessor tableViewLogic: TableViewUILogic;
    get tableViewManager(): import("../../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-header-column': DatabaseHeaderColumn;
    }
}
export {};
//# sourceMappingURL=database-header-column.d.ts.map