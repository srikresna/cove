import { WidgetBase } from '../../../../core/widget/widget-base.js';
import type { KanbanViewUILogic } from '../../../../view-presets/kanban/pc/kanban-view-ui-logic.js';
import type { VirtualTableViewUILogic } from '../../../../view-presets/table/pc-virtual/table-view-ui-logic.js';
export declare class DataViewHeaderToolsSearch extends WidgetBase<VirtualTableViewUILogic | KanbanViewUILogic> {
    static styles: import("lit").CSSResult;
    private readonly _clearSearch;
    private readonly _clickSearch;
    private readonly _onSearch;
    private readonly _onSearchBlur;
    private readonly _onSearchKeydown;
    preventBlur: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _searchInput;
    private accessor showSearch;
}
declare global {
    interface HTMLElementTagNameMap {
        'data-view-header-tools-search': DataViewHeaderToolsSearch;
    }
}
//# sourceMappingURL=search.d.ts.map