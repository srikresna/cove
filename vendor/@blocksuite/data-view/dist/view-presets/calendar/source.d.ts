import type { DataSource } from '../../core/data-source/base.js';
import type { CalendarExternalSource, CalendarStoredViewData } from './types.js';
export type CalendarExternalSourceFactory = {
    id: string;
    create(viewData: CalendarStoredViewData): CalendarExternalSource;
};
export declare const CalendarExternalSourceProvider: import("@blocksuite/global/di").ServiceIdentifier<CalendarExternalSourceFactory> & (<U extends CalendarExternalSourceFactory = CalendarExternalSourceFactory>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const getCalendarExternalSources: (dataSource: DataSource, viewData: CalendarStoredViewData) => CalendarExternalSource[];
//# sourceMappingURL=source.d.ts.map