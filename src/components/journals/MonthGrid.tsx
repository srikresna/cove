import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const keyOf = (timestamp: number): string => dayKey(new Date(timestamp));

interface MonthGridProps {
  /** First day of the month to show. */
  month: Date;
  selectedKey: string | null;
  /** Calendar-day keys that carry a journal note. */
  journalDays: Set<string>;
  onSelectDay: (key: string) => void;
  onShiftMonth: (delta: number) => void;
}

/**
 * A full 6-week (42-cell) month grid with faded adjacent days and typed
 * journal dots.
 */
export const MonthGrid: React.FC<MonthGridProps> = ({
  month,
  selectedKey,
  journalDays,
  onSelectDay,
  onShiftMonth,
}) => {
  const cells = useMemo(() => {
    // Full 6-week grid; adjacent-month days render faded (and clickable), no leading blanks.
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstOfMonth = new Date(year, monthIndex, 1);
    const start = new Date(year, monthIndex, 1 - firstOfMonth.getDay());
    const list: Date[] = [];
    for (let i = 0; i < 42; i++) {
      list.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return list;
  }, [month]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(month);

  const todayKey = dayKey(new Date());

  return (
    <div>
      <div className="flex items-center justify-between pb-1">
        <span className="text-[13px] font-semibold text-foreground">{monthLabel}</span>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Previous month"
            onClick={() => onShiftMonth(-1)}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Next month"
            onClick={() => onShiftMonth(1)}
            className="text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((weekday, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed 7-entry weekday header
            key={index}
            className="pb-1 text-[10px] font-semibold uppercase text-muted-foreground"
          >
            {weekday}
          </span>
        ))}
        {cells.map((date, index) => {
          const key = dayKey(date);
          const isSelected = key === selectedKey;
          const notCurrentMonth = date.getMonth() !== month.getMonth();
          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed 42-cell grid with duplicate day keys across months
              key={`${key}-${index}`}
              type="button"
              onClick={() => onSelectDay(key)}
              aria-pressed={isSelected}
              className={cn(
                "mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-md text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border bg-card font-semibold text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                key === todayKey && !isSelected && "font-semibold text-primary",
                notCurrentMonth && !isSelected && "text-muted-foreground/40",
              )}
            >
              <span className="leading-none">{date.getDate()}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 h-1 w-1 rounded-full",
                  journalDays.has(key) ? "bg-primary" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** Convenience: calendar-day key for a journal timestamp. */
export const journalDayKey = keyOf;
