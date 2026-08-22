import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const CELL = 28;
const GAP = 8;

/**
 * AFFiNE-metrics month calendar used by property date pickers: 28px day
 * cells with 8px gaps (244px min width), Sunday-start week header, today in
 * bold brand color, selected day in brand background, adjacent-month days
 * faded, month switcher with a TODAY shortcut that commits today directly.
 */
export const PropertyCalendar: React.FC<{
  value: number | null;
  onChange: (timestamp: number) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const selected = value != null ? new Date(value) : null;
  const [cursor, setCursor] = useState(() => startOfMonth(selected ?? new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    const list: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) list.push(d);
    return list;
  }, [cursor]);

  const today = new Date();

  return (
    <div
      className={cn("select-none text-sm", className)}
      style={{ minWidth: `calc(${CELL}px * 7 + ${GAP}px * 6)` }}
    >
      <div className="mb-1 flex items-center justify-between" style={{ height: CELL }}>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setCursor((prev) => startOfMonth(prev))}
            className="flex h-6 items-center rounded px-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {format(cursor, "MMMM")}
          </button>
          <button
            type="button"
            onClick={() => setCursor((prev) => startOfMonth(prev))}
            className="flex h-6 items-center rounded px-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            {format(cursor, "yyyy")}
          </button>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setCursor((prev) => subMonths(prev, 1))}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCursor(startOfMonth(now));
              onChange(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime());
            }}
            className="flex h-6 items-center rounded px-1 text-sm font-normal uppercase text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {MESSAGES.JOURNAL_TODAY}
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor((prev) => addMonths(prev, 1))}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7" style={{ gap: `${GAP}px` }}>
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="flex items-center justify-center text-sm font-medium text-muted-foreground"
            style={{ height: CELL }}
          >
            {weekday}
          </div>
        ))}
        {days.map((day) => {
          const isSelected = selected != null && isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const notCurrentMonth = !isSameMonth(day, cursor);
          return (
            <button
              key={day.toISOString()}
              type="button"
              aria-label={format(day, "yyyy-MM-dd")}
              onClick={() => {
                const [y, m, d] = [day.getFullYear(), day.getMonth(), day.getDate()];
                onChange(new Date(y, m, d).getTime());
              }}
              style={{ height: CELL }}
              className={cn(
                "flex items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "bg-primary font-medium text-primary-foreground hover:bg-primary",
                !isSelected && isToday && "font-semibold text-primary",
                !isSelected && !isToday && "text-foreground",
                notCurrentMonth && !isSelected && "text-muted-foreground/40",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};
