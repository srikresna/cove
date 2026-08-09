import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../../../../core/group-by/trait';
import type { TableSingleView } from '../../../../table-view-manager';
declare const VirtualDataBaseColumnStats_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class VirtualDataBaseColumnStats extends VirtualDataBaseColumnStats_base {
    static styles: import("lit").CSSResult;
    protected render(): import("lit-html").TemplateResult<1>;
    accessor group: Group | undefined;
    accessor view: TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-virtual-column-stats': VirtualDataBaseColumnStats;
    }
}
export {};
//# sourceMappingURL=column-stats-bar.d.ts.map