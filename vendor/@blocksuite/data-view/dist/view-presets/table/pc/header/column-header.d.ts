import { ShadowlessElement } from '@blocksuite/std';
import { type TemplateResult } from 'lit';
import { type TableViewUILogic } from '../table-view-ui-logic.js';
declare const DatabaseColumnHeader_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class DatabaseColumnHeader extends DatabaseColumnHeader_base {
    static styles: import("lit").CSSResult;
    private readonly _onAddColumn;
    editLastColumnTitle: () => void;
    preMove: number;
    private get readonly();
    private autoSetHeaderPosition;
    connectedCallback(): void;
    getScale(): number;
    render(): TemplateResult;
    accessor renderGroupHeader: (() => TemplateResult) | undefined;
    accessor scaleDiv: HTMLDivElement;
    accessor tableViewLogic: TableViewUILogic;
    get tableViewManager(): import("../../table-view-manager.js").TableSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-database-column-header': DatabaseColumnHeader;
    }
}
export {};
//# sourceMappingURL=column-header.d.ts.map