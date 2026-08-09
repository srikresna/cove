import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../../../../core/group-by/trait';
import type { TableProperty, TableSingleView } from '../../../../table-view-manager';
import type { VirtualTableViewUILogic } from '../../../table-view-ui-logic';
declare const DataViewColumnPreview_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DataViewColumnPreview extends DataViewColumnPreview_base {
    static styles: import("lit").CSSResult;
    get tableViewManager(): TableSingleView;
    private renderGroup;
    render(): import("lit-html").TemplateResult;
    accessor column: TableProperty;
    accessor container: HTMLElement;
    accessor group: Group | undefined;
    accessor tableViewLogic: VirtualTableViewUILogic;
}
declare global {
    interface HTMLElementTagNameMap {
        'virtual-data-view-column-preview': DataViewColumnPreview;
    }
}
export {};
//# sourceMappingURL=column-move-preview.d.ts.map