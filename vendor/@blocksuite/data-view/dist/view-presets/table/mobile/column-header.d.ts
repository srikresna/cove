import { ShadowlessElement } from '@blocksuite/std';
import type { TableProperty, TableSingleView } from '../table-view-manager.js';
declare const MobileTableColumnHeader_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileTableColumnHeader extends MobileTableColumnHeader_base {
    static styles: import("lit").CSSResult;
    private readonly _clickColumn;
    editTitle: () => void;
    private popMenu;
    render(): import("lit-html").TemplateResult;
    accessor column: TableProperty;
    accessor tableViewManager: TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-table-column-header': MobileTableColumnHeader;
    }
}
export {};
//# sourceMappingURL=column-header.d.ts.map