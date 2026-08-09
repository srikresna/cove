import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type ReadonlySignal } from '@preact/signals-core';
import { FilterTrait } from '../../core/filter/trait.js';
import { PropertyBase } from '../../core/view-manager/property.js';
import { type Row, RowBase } from '../../core/view-manager/row.js';
import { SingleViewBase } from '../../core/view-manager/single-view.js';
import type { ViewManager } from '../../core/view-manager/view-manager.js';
import type { CalendarEntry, CalendarEntryRange, CalendarExternalEntry, CalendarExternalSource, CalendarRowEntry, CalendarStoredViewData } from './types.js';
export type CalendarDateMapping = {
    status: 'ready';
    propertyId: string;
} | {
    status: 'setup';
    propertyId?: string;
};
export declare class CalendarSingleView extends SingleViewBase<CalendarStoredViewData> {
    private readonly externalEntries$;
    private externalEntriesRequestId;
    propertiesRaw$: ReadonlySignal<CalendarProperty[]>;
    properties$: ReadonlySignal<CalendarProperty[]>;
    detailProperties$: ReadonlySignal<CalendarProperty[]>;
    private readonly filter$;
    private readonly sortList$;
    emptyMonthHintDismissed$: ReadonlySignal<boolean>;
    private readonly sortManager;
    filterTrait: FilterTrait;
    mainProperties$: ReadonlySignal<{
        titleColumn: string | undefined;
    }>;
    readonly$: ReadonlySignal<boolean>;
    dateProperties$: ReadonlySignal<CalendarProperty[]>;
    dateMapping$: ReadonlySignal<CalendarDateMapping>;
    startDateMapping$: ReadonlySignal<CalendarDateMapping>;
    endDateMapping$: ReadonlySignal<CalendarDateMapping>;
    private readonly visibleCardProperties$;
    rowEntries$: ReadonlySignal<CalendarRowEntry[]>;
    entries$: ReadonlySignal<CalendarEntry[]>;
    externalSources$: ReadonlySignal<CalendarExternalSource[]>;
    get type(): string;
    constructor(viewManager: ViewManager, viewId: string);
    isShow(rowId: string): boolean;
    rowsMapping(rows: Row[]): Row[];
    propertyGetOrCreate(propertyId: string): CalendarProperty;
    rowGetOrCreate(rowId: string): CalendarRow;
    setStartDateColumn(propertyId: string): void;
    setDateColumn(propertyId: string): void;
    setEndDateColumn(propertyId: string | undefined): void;
    setWorkspaceCalendarEnabled(enabled: boolean): void;
    setWorkspaceCalendarSubscriptionIds(subscriptionIds?: string[]): void;
    dismissEmptyMonthHint(): void;
    getDocDisplayTitle(docId: string): string;
    createStartDateColumn(): string | undefined;
    createDateColumn(): string | undefined;
    createEndDateColumn(): string | undefined;
    createRowOnDate(date: number | Date): string | undefined;
    createLinkedDocRowOnDate(date: number | Date, docId: string): string | undefined;
    moveRowToDate(rowId: string, date: number | Date): void;
    resizeRowRange(rowId: string, edge: 'start' | 'end', date: number | Date): void;
    loadExternalEntries(range: CalendarEntryRange): Promise<CalendarExternalEntry[]>;
}
export declare class CalendarProperty extends PropertyBase {
    hide$: ReadonlySignal<boolean>;
    constructor(view: CalendarSingleView, propertyId: string);
    hideSet(_hide: boolean): void;
    move(_position: InsertToPosition): void;
}
export declare class CalendarRow extends RowBase {
    readonly calendarView: CalendarSingleView;
    constructor(calendarView: CalendarSingleView, rowId: string);
}
//# sourceMappingURL=calendar-view-manager.d.ts.map