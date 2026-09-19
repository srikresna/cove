import { MESSAGES } from "../../constants/messages";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";

export const eventStartMs = (event: GcalAgendaEvent): number =>
  event.start.dateTime
    ? Date.parse(event.start.dateTime)
    : event.start.date
      ? new Date(`${event.start.date}T00:00:00`).getTime()
      : 0;

export const eventEndMs = (event: GcalAgendaEvent): number =>
  event.end.dateTime
    ? Date.parse(event.end.dateTime)
    : event.end.date
      ? new Date(`${event.end.date}T00:00:00`).getTime()
      : 0;

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const isAllDay = (event: GcalAgendaEvent): boolean => !event.start.dateTime;

export const timeLabel = (event: GcalAgendaEvent): string => {
  if (!event.start.dateTime) return MESSAGES.GCAL_EVENT_ALL_DAY;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(event.start.dateTime),
  );
};

export const timeRangeLabel = (event: GcalAgendaEvent): string => {
  if (!event.start.dateTime) return MESSAGES.GCAL_EVENT_ALL_DAY;
  const start = new Date(event.start.dateTime);
  const end = new Date(event.end.dateTime ?? event.start.dateTime);
  const sameDay = dayKey(start) === dayKey(end);
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(sameDay ? {} : { weekday: "short", month: "short", day: "numeric" }),
  });
  return `${formatter.format(start)} – ${formatter.format(end)}`;
};

export const longDateLabel = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);

/** Local midnights from the event start day up to (excluding) its end day, capped at 62. */
export const eventDayKeys = (event: GcalAgendaEvent): string[] => {
  const keys: string[] = [];
  const cursor = new Date(eventStartMs(event));
  cursor.setHours(0, 0, 0, 0);
  const end = eventEndMs(event);
  for (let day = 0; day < 62 && cursor.getTime() < end; day++) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};

export interface WeekBar {
  event: GcalAgendaEvent;
  colStart: number;
  span: number;
  startsHere: boolean;
  endsHere: boolean;
}

/**
 * Bars for one week row: grid columns 1..7, all-day/long events first,
 * timed events after, sorted by start time.
 */
export const weekBars = (events: GcalAgendaEvent[], weekStart: Date): WeekBar[] => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const colOfDay = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const cursor = new Date(weekStart);
    cursor.setDate(cursor.getDate() + i);
    colOfDay.set(dayKey(cursor), i + 1);
  }
  const bars: WeekBar[] = [];
  for (const event of events) {
    const startDay = new Date(eventStartMs(event));
    startDay.setHours(0, 0, 0, 0);
    const endExclusive = new Date(eventEndMs(event));
    endExclusive.setHours(0, 0, 0, 0);
    if (endExclusive.getTime() <= startDay.getTime()) {
      endExclusive.setDate(endExclusive.getDate() + 1);
    }
    if (endExclusive.getTime() <= weekStart.getTime()) continue;
    if (startDay.getTime() >= weekEnd.getTime()) continue;
    const first = startDay > weekStart ? startDay : new Date(weekStart);
    const last = endExclusive < weekEnd ? endExclusive : new Date(weekEnd);
    if (first >= last) continue;
    const colStart = colOfDay.get(dayKey(first)) ?? 1;
    const span = Math.max(
      1,
      Math.min(Math.round((last.getTime() - first.getTime()) / 86_400_000), 7 - colStart + 1),
    );
    bars.push({
      event,
      colStart,
      span,
      startsHere: startDay >= weekStart,
      endsHere: endExclusive <= weekEnd,
    });
  }
  return bars.sort((a, b) => {
    const aSpan = b.span - a.span;
    if (aSpan !== 0) return aSpan;
    return eventStartMs(a.event) - eventStartMs(b.event);
  });
};

export const buildWeeks = (monthCursor: Date): Date[] => {
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const last = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const weeks: Date[] = [];
  for (let cursor = new Date(start); cursor <= last; cursor.setDate(cursor.getDate() + 7)) {
    weeks.push(new Date(cursor));
  }
  return weeks;
};

export const shiftEventDates = (
  event: GcalAgendaEvent,
  deltaDays: number,
): { start: GcalAgendaEvent["start"]; end: GcalAgendaEvent["end"] } => {
  const shift = (value: string): string => {
    const date = new Date(value);
    date.setDate(date.getDate() + deltaDays);
    return event.start.dateTime
      ? date.toISOString()
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate(),
        ).padStart(2, "0")}`;
  };
  return {
    start: event.start.dateTime
      ? { dateTime: shift(event.start.dateTime) }
      : { date: shift(event.start.date ?? "") },
    end: event.end.dateTime
      ? { dateTime: shift(event.end.dateTime) }
      : { date: shift(event.end.date ?? "") },
  };
};
