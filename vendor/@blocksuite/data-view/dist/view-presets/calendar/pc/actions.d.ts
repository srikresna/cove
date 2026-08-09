import type { DataViewRootUILogic } from '../../../core/data-view.js';
import type { CalendarSingleView } from '../calendar-view-manager.js';
import type { CalendarEntry } from '../types.js';
export declare const formatEntryTime: (entry: CalendarEntry) => string;
export declare const openCalendarEntry: (root: DataViewRootUILogic, view: CalendarSingleView, entry: CalendarEntry, target: HTMLElement, options?: {
    selectEntry?: (entryId: string | undefined) => void;
}) => void;
//# sourceMappingURL=actions.d.ts.map