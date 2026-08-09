import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../../../../core/group-by/trait';
import type { StatisticsConfig } from '../../../../../../core/statistics/types';
import type { TableProperty } from '../../../../table-view-manager';
declare const VirtualDatabaseColumnStatsCell_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class VirtualDatabaseColumnStatsCell extends VirtualDatabaseColumnStatsCell_base {
    static styles: import("lit").CSSResult;
    accessor column: TableProperty;
    cellValues$: import("@preact/signals-core").ReadonlySignal<unknown[]>;
    groups$: import("@preact/signals-core").ReadonlySignal<Record<string, Record<string, StatisticsConfig>>>;
    openMenu: (ev: MouseEvent) => void;
    statsFunc$: import("@preact/signals-core").ReadonlySignal<StatisticsConfig | undefined>;
    values$: import("@preact/signals-core").Signal<unknown[]>;
    statsResult$: import("@preact/signals-core").ReadonlySignal<{
        name: string | undefined;
        value: string;
    } | null>;
    subscriptionMap: Map<unknown, () => void>;
    connectedCallback(): void;
    protected render(): import("lit-html").TemplateResult<1>;
    accessor group: Group | undefined;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-virtual-column-stats-cell': VirtualDatabaseColumnStatsCell;
    }
}
export {};
//# sourceMappingURL=column-stats-column.d.ts.map