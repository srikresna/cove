import { ShadowlessElement } from '@blocksuite/std';
import { type ReadonlySignal } from '@preact/signals-core';
import type { Variable } from '../../../core/expression/types.js';
import type { Filter, FilterGroup } from '../../../core/filter/types.js';
import type { DataViewUILogicBase } from '../../../core/view/data-view-base.js';
declare const FilterBar_base: typeof ShadowlessElement;
export declare class FilterBar extends FilterBar_base {
    static styles: import("lit").CSSResult;
    private readonly _setFilter;
    private readonly addFilter;
    private readonly expandGroup;
    accessor filterGroup: ReadonlySignal<FilterGroup>;
    conditions$: ReadonlySignal<Filter[]>;
    renderAddFilter: () => import("lit-html").TemplateResult<1>;
    setConditions: (conditions: Filter[]) => void;
    updateMoreFilterPanel?: () => void;
    private deleteFilter;
    render(): import("lit-html").TemplateResult<1>;
    renderCondition(i: number): import("lit-html").TemplateResult<1> | undefined;
    renderFilters(): (import("lit-html").TemplateResult<1> | undefined)[];
    updated(): void;
    accessor onChange: (filter: FilterGroup) => void;
    accessor vars: ReadonlySignal<Variable[]>;
    accessor dataViewLogic: DataViewUILogicBase;
}
declare global {
    interface HTMLElementTagNameMap {
        'filter-bar': FilterBar;
    }
}
export {};
//# sourceMappingURL=list-view.d.ts.map