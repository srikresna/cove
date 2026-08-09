import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../core/group-by/trait.js';
import type { TableViewUILogic } from '../pc/table-view-ui-logic.js';
declare const DataBaseColumnStats_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DataBaseColumnStats extends DataBaseColumnStats_base {
    static styles: import("lit").CSSResult;
    protected render(): import("lit-html").TemplateResult<1>;
    accessor group: Group | undefined;
    accessor tableViewLogic: TableViewUILogic;
    get view(): import("../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-column-stats': DataBaseColumnStats;
    }
}
export {};
//# sourceMappingURL=column-stats-bar.d.ts.map