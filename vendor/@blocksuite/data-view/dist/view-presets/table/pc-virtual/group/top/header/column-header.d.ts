import { ShadowlessElement } from '@blocksuite/std';
import type { VirtualTableViewUILogic } from '../../../table-view-ui-logic';
declare const VirtualTableHeader_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class VirtualTableHeader extends VirtualTableHeader_base {
    private readonly _onAddColumn;
    openPropertyMenuById: (id: string) => void;
    private get readonly();
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult;
    accessor scaleDiv: HTMLDivElement;
    accessor tableViewLogic: VirtualTableViewUILogic;
    get tableViewManager(): import("../../../..").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'virtual-table-header': VirtualTableHeader;
    }
}
export {};
//# sourceMappingURL=column-header.d.ts.map