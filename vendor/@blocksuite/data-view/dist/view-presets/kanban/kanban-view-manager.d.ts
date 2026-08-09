import { type InsertToPosition } from '@blocksuite/affine-shared/utils';
import { FilterTrait } from '../../core/filter/trait.js';
import type { FilterGroup } from '../../core/filter/types.js';
import { GroupTrait } from '../../core/group-by/trait.js';
import { PropertyBase } from '../../core/view-manager/property.js';
import type { Row } from '../../core/view-manager/row.js';
import { SingleViewBase } from '../../core/view-manager/single-view.js';
import type { ViewManager } from '../../core/view-manager/view-manager.js';
import type { KanbanViewColumn, KanbanViewData } from './define.js';
export declare const materializeKanbanColumns: (columns: KanbanViewColumn[], propertyIds: string[]) => KanbanViewColumn[];
export declare class KanbanSingleView extends SingleViewBase<KanbanViewData> {
    propertiesRaw$: import("@preact/signals-core").ReadonlySignal<KanbanColumn[]>;
    properties$: import("@preact/signals-core").ReadonlySignal<KanbanColumn[]>;
    detailProperties$: import("@preact/signals-core").ReadonlySignal<KanbanColumn[]>;
    filter$: import("@preact/signals-core").ReadonlySignal<FilterGroup>;
    private readonly sortList$;
    private readonly sortManager;
    filterTrait: FilterTrait;
    groupBy$: import("@preact/signals-core").ReadonlySignal<import("../../index.js").GroupBy | undefined>;
    groupTrait: GroupTrait;
    mainProperties$: import("@preact/signals-core").ReadonlySignal<{
        titleColumn?: string;
        iconColumn?: string;
        coverColumn?: string;
    }>;
    readonly$: import("@preact/signals-core").ReadonlySignal<boolean>;
    get columns(): KanbanColumn[];
    get filter(): FilterGroup;
    get header(): {
        titleColumn?: string;
        iconColumn?: string;
        coverColumn?: string;
    } | undefined;
    get type(): string;
    private materializeColumns;
    get view(): KanbanViewData | undefined;
    addCard(position: InsertToPosition, group: string): string;
    getHeaderCover(_rowId: string): KanbanColumn | undefined;
    getHeaderIcon(_rowId: string): KanbanColumn | undefined;
    getHeaderTitle(_rowId: string): KanbanColumn | undefined;
    hasHeader(_rowId: string): boolean;
    isInHeader(columnId: string): boolean;
    isShow(rowId: string): boolean;
    protected rowsMapping(rows: Row[]): Row[];
    propertyGetOrCreate(columnId: string): KanbanColumn;
    constructor(viewManager: ViewManager, viewId: string);
}
type KanbanColumnData = KanbanViewData['columns'][number];
export declare class KanbanColumn extends PropertyBase {
    private readonly kanbanView;
    move(position: InsertToPosition): void;
    hideSet(hide: boolean): void;
    hide$: import("@preact/signals-core").ReadonlySignal<boolean>;
    viewData$: import("@preact/signals-core").ReadonlySignal<KanbanViewColumn | undefined>;
    viewDataUpdate(updater: (viewData: KanbanColumnData) => Partial<KanbanColumnData>): void;
    constructor(kanbanView: KanbanSingleView, columnId: string);
}
export {};
//# sourceMappingURL=kanban-view-manager.d.ts.map