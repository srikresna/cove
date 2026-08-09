import type { CalendarEntry } from './types.js';
export type CalendarDayLayout = {
    date: number;
    inMonth: boolean;
    entries: CalendarEntry[];
    segments: CalendarRangeSegment[];
};
export type CalendarRangeSegment = {
    entry: CalendarEntry;
    weekIndex: number;
    startIndex: number;
    span: number;
    slot: number;
    startsBeforeWeek: boolean;
    endsAfterWeek: boolean;
};
export type CalendarMonthLayout = {
    from: number;
    to: number;
    weeks: CalendarDayLayout[][];
    days: CalendarDayLayout[];
    segments: CalendarRangeSegment[];
};
export type CalendarMonthLayoutOptions = {
    month: number | Date;
    entries: CalendarEntry[];
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};
export declare const getCalendarVisibleMonthRange: (month: number | Date, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    from: number;
    to: number;
    monthStart: number;
    monthEnd: number;
};
export declare const getCalendarDaySegmentSlots: (day: CalendarDayLayout, ignoredEntryId?: string) => number;
export declare const getCalendarDayContentSlots: (day: CalendarDayLayout, ignoredEntryId?: string) => number;
export declare const createCalendarMonthLayout: ({ month, entries, weekStartsOn, }: CalendarMonthLayoutOptions) => CalendarMonthLayout;
//# sourceMappingURL=layout.d.ts.map