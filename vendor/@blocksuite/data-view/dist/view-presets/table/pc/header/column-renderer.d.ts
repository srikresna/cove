import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../../core/group-by/trait.js';
import type { TableProperty, TableSingleView } from '../../table-view-manager.js';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
declare const DataViewColumnPreview_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DataViewColumnPreview extends DataViewColumnPreview_base {
    static styles: import("lit").CSSResult;
    get tableViewManager(): TableSingleView;
    private renderGroup;
    render(): import("lit-html").TemplateResult;
    accessor column: TableProperty;
    accessor container: HTMLElement;
    accessor group: Group | undefined;
    accessor tableViewLogic: TableViewUILogic;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-column-preview': DataViewColumnPreview;
    }
}
export {};
//# sourceMappingURL=column-renderer.d.ts.map