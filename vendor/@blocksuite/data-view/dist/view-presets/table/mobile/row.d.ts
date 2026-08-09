import { ShadowlessElement } from '@blocksuite/std';
import type { MobileTableViewUILogic } from './table-view-ui-logic.js';
declare const MobileTableRow_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileTableRow extends MobileTableRow_base {
    static styles: import("lit").CSSResult;
    get groupKey(): string | undefined;
    connectedCallback(): void;
    protected render(): unknown;
    accessor tableViewLogic: MobileTableViewUILogic;
    accessor rowId: string;
    accessor rowIndex: number;
    get view(): import("../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-table-row': MobileTableRow;
    }
}
export {};
//# sourceMappingURL=row.d.ts.map