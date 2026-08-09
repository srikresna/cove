import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type ReadonlySignal } from '@preact/signals-core';
import { FilterTrait } from '../../core/filter/trait.js';
import { GroupTrait } from '../../core/group-by/trait.js';
import { PropertyBase } from '../../core/view-manager/property.js';
import { type Row, RowBase } from '../../core/view-manager/row.js';
import { SingleViewBase } from '../../core/view-manager/single-view.js';
import type { ViewManager } from '../../core/view-manager/view-manager.js';
import type { TableViewData } from './define.js';
export declare const materializeColumnsByPropertyIds: (columns: TableColumnData[], propertyIds: string[], getDefaultWidth?: (id: string) => number) => import("./define.js").TableViewColumn[];
export declare const materializeTableColumns: (columns: TableColumnData[], propertyIds: string[], getDefaultWidth?: (id: string) => number) => import("./define.js").TableViewColumn[];
export declare class TableSingleView extends SingleViewBase<TableViewData> {
    propertiesRaw$: ReadonlySignal<TableProperty[]>;
    properties$: ReadonlySignal<TableProperty[]>;
    private readonly filter$;
    private readonly groupBy$;
    private readonly sortList$;
    private readonly sortManager;
    detailProperties$: ReadonlySignal<TableProperty[]>;
    filterTrait: FilterTrait;
    groupTrait: GroupTrait;
    mainProperties$: ReadonlySignal<{
        titleColumn?: string;
        iconColumn?: string;
        imageColumn?: string;
    }>;
    readonly$: ReadonlySignal<boolean>;
    get groupProperties(): import("../../index.js").GroupProperty[];
    get name(): string;
    get type(): string;
    isShow(rowId: string): boolean;
    propertyGetOrCreate(columnId: string): TableProperty;
    rowGetOrCreate(rowId: string): TableRow;
    rowAdd(insertPosition: InsertToPosition | number, groupKey?: string): string;
    rowsMapping(rows: Row[]): Row[];
    readonly computedProperties$: ReadonlySignal<TableColumnData[]>;
    private materializeColumns;
    constructor(viewManager: ViewManager, viewId: string);
}
type TableColumnData = TableViewData['columns'][number];
export declare class TableProperty extends PropertyBase {
    private readonly tableView;
    hideSet(hide: boolean): void;
    move(position: InsertToPosition): void;
    hide$: ReadonlySignal<boolean>;
    statCalcOp$: ReadonlySignal<string | undefined>;
    width$: ReadonlySignal<number>;
    get minWidth(): number;
    constructor(tableView: TableSingleView, columnId: string);
    viewDataUpdate(updater: (viewData: TableColumnData) => Partial<TableColumnData>): void;
    viewData$: ReadonlySignal<import("./define.js").TableViewColumn | undefined>;
    updateStatCalcOp(type?: string): void;
    updateWidth(width: number): void;
}
export declare class TableRow extends RowBase {
    readonly tableView: TableSingleView;
    move(position: InsertToPosition, fromGroup?: string, toGroup?: string): void;
    constructor(tableView: TableSingleView, rowId: string);
}
export {};
//# sourceMappingURL=table-view-manager.d.ts.map