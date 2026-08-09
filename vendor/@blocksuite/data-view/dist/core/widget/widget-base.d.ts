import { ShadowlessElement } from '@blocksuite/std';
import type { DataViewUILogicBase } from '../view/data-view-base.js';
import type { DataViewWidgetProps } from './types.js';
declare const WidgetBase_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class WidgetBase<ViewLogic extends DataViewUILogicBase = DataViewUILogicBase> extends WidgetBase_base implements DataViewWidgetProps<ViewLogic> {
    get dataSource(): import("../index.js").DataSource;
    get view(): import("../index.js").SingleView;
    get viewManager(): import("../index.js").ViewManager;
    accessor dataViewLogic: ViewLogic;
}
export {};
//# sourceMappingURL=widget-base.d.ts.map