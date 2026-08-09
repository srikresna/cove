const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const addDays = (date, days) => {
    const current = new Date(date);
    return startOfDay(new Date(current.getFullYear(), current.getMonth(), current.getDate() + days));
};
const endOfDay = (date) => addDays(date, 1) - 1;
const toDate = (value) => value instanceof Date ? value : new Date(value);
export const getCalendarVisibleMonthRange = (month, weekStartsOn = 0) => {
    const cursor = toDate(month);
    const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startOffset = (monthStart.getDay() - weekStartsOn + 7) % 7;
    const endOffset = (weekStartsOn + 6 - monthEnd.getDay() + 7) % 7;
    const from = startOfDay(new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - startOffset));
    const to = endOfDay(startOfDay(new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + endOffset)));
    return {
        from,
        to,
        monthStart: startOfDay(monthStart),
        monthEnd: endOfDay(startOfDay(monthEnd)),
    };
};
const isRangeEntry = (entry) => entry.endAt != null &&
    getRangeEndDay(entry) > startOfDay(new Date(entry.startAt));
const getRangeEndDay = (entry) => {
    const endAt = entry.endAt ?? entry.startAt;
    const end = new Date(endAt);
    if (entry.kind === 'external' &&
        entry.allDay &&
        endAt > entry.startAt &&
        end.getHours() === 0 &&
        end.getMinutes() === 0 &&
        end.getSeconds() === 0 &&
        end.getMilliseconds() === 0) {
        return addDays(startOfDay(end), -1);
    }
    return startOfDay(end);
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const getDayOffset = (days, date) => days.findIndex(day => day.date === date);
const assignSegmentSlots = (weeks, segments) => {
    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
        const weekSegments = segments.filter(segment => segment.weekIndex === weekIndex);
        const slots = [];
        for (const segment of weekSegments) {
            let slot = 0;
            while (slots[slot]?.some((occupied, index) => occupied &&
                index >= segment.startIndex &&
                index < segment.startIndex + segment.span)) {
                slot++;
            }
            const slotDays = (slots[slot] ??= Array.from({ length: 7 }, () => false));
            for (let index = segment.startIndex; index < segment.startIndex + segment.span; index++) {
                slotDays[index] = true;
            }
            segment.slot = slot;
        }
    }
};
export const getCalendarDaySegmentSlots = (day, ignoredEntryId) => {
    return Math.max(0, ...day.segments
        .filter(segment => segment.entry.id !== ignoredEntryId)
        .map(segment => segment.slot + 1));
};
export const getCalendarDayContentSlots = (day, ignoredEntryId) => {
    return (getCalendarDaySegmentSlots(day, ignoredEntryId) +
        day.entries.filter(entry => entry.id !== ignoredEntryId).length);
};
export const createCalendarMonthLayout = ({ month, entries, weekStartsOn = 0, }) => {
    const range = getCalendarVisibleMonthRange(month, weekStartsOn);
    const cursor = toDate(month);
    const days = [];
    const dayByTime = new Map();
    for (let date = range.from; date <= range.to; date = addDays(date, 1)) {
        const day = {
            date,
            inMonth: new Date(date).getMonth() === cursor.getMonth() &&
                new Date(date).getFullYear() === cursor.getFullYear(),
            entries: [],
            segments: [],
        };
        days.push(day);
        dayByTime.set(date, day);
    }
    for (const entry of entries) {
        if (isRangeEntry(entry)) {
            continue;
        }
        const day = dayByTime.get(startOfDay(new Date(entry.startAt)));
        if (day) {
            day.entries.push(entry);
        }
    }
    const segments = [];
    const rangeEntries = entries.filter(isRangeEntry);
    const visibleEndDay = startOfDay(new Date(range.to));
    for (const entry of rangeEntries) {
        const entryStart = startOfDay(new Date(entry.startAt));
        const entryEnd = getRangeEndDay(entry);
        if (entryEnd < range.from || entryStart > visibleEndDay) {
            continue;
        }
        const start = clamp(entryStart, range.from, visibleEndDay);
        const end = clamp(entryEnd, range.from, visibleEndDay);
        const startOffset = getDayOffset(days, start);
        const endOffset = getDayOffset(days, end);
        if (startOffset < 0 || endOffset < 0) {
            continue;
        }
        let offset = startOffset;
        while (offset <= endOffset) {
            const weekIndex = Math.floor(offset / 7);
            const startIndex = offset % 7;
            const weekEndOffset = weekIndex * 7 + 6;
            const span = Math.min(endOffset, weekEndOffset) - offset + 1;
            const segment = {
                entry,
                weekIndex,
                startIndex,
                span,
                slot: 0,
                startsBeforeWeek: startOffset < weekIndex * 7,
                endsAfterWeek: endOffset > weekEndOffset,
            };
            segments.push(segment);
            for (let index = 0; index < span; index++) {
                days[offset + index]?.segments.push(segment);
            }
            offset += span;
        }
    }
    const weeks = [];
    for (let index = 0; index < days.length; index += 7) {
        weeks.push(days.slice(index, index + 7));
    }
    assignSegmentSlots(weeks, segments);
    return { from: range.from, to: range.to, weeks, days, segments };
};
