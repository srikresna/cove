import { type PopupTarget } from '@blocksuite/affine-components/context-menu';
import { ShadowlessElement } from '@blocksuite/std';
import { type Middleware } from '@floating-ui/dom';
import { type ReadonlySignal } from '@preact/signals-core';
import type { Variable } from '../../../core/expression/types.js';
import type { FilterTrait } from '../../../core/filter/trait.js';
import type { Filter, FilterGroup } from '../../../core/filter/types.js';
import { type DataViewUILogicBase } from '../../../core/index.js';
import { type FilterGroupView } from './group-panel-view.js';
declare const FilterRootView_base: typeof ShadowlessElement;
export declare class FilterRootView extends FilterRootView_base {
    static styles: import("lit").CSSResult;
    private readonly _setFilter;
    private readonly expandGroup;
    accessor filterGroup: ReadonlySignal<FilterGroup>;
    conditions$: ReadonlySignal<Filter[]>;
    setConditions: (conditions: Filter[]) => void;
    private _clickConditionOps;
    private deleteFilter;
    render(): import("lit-html").TemplateResult<1>;
    renderCondition(i: number): import("lit-html").TemplateResult<1> | undefined;
    accessor containerClass: {
        index: number;
        class: string;
    } | undefined;
    accessor onBack: () => void;
    accessor onChange: (filter: FilterGroup) => void;
    accessor vars: ReadonlySignal<Variable[]>;
}
declare global {
    interface HTMLElementTagNameMap {
        'filter-root-view': FilterGroupView;
    }
}
export declare const popFilterRoot: (target: PopupTarget, props: {
    filterTrait: FilterTrait;
    onBack: () => void;
    onClose?: () => void;
    dataViewLogic: DataViewUILogicBase;
}, middleware?: Array<Middleware | null | undefined | false>) => void;
export {};
//# sourceMappingURL=root-panel-view.d.ts.map