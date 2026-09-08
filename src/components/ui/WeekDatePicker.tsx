import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CELL_W = 39;
const CELL_GAP = 4;

const dayKey = (d: Date): string => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const sameDay = (a: Date, b: Date): boolean => dayKey(a) === dayKey(b);

const startOfWeekLocal = (d: Date): Date => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const addDaysLocal = (d: Date, n: number): Date => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const WeekDatePicker: React.FC<{
  value: number | null;
  onChange: (timestamp: number) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const selected = useMemo(() => (value != null ? new Date(value) : null), [value]);
  const [cursor, setCursor] = useState<Date>(() => selected ?? new Date());
  const cursorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === "number") setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selected) setCursor(selected);
  }, [selected]);

  const fitCount = Math.floor((width - 56) / (CELL_W + CELL_GAP));
  const viewport = width > 0 ? Math.max(1, Math.min(7, fitCount)) : 7;
  const dense = width > 0 && width < 300;

  const weekStart = useMemo(() => startOfWeekLocal(cursor), [cursor]);
  const allDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysLocal(weekStart, i)),
    [weekStart],
  );
  const displayDays = useMemo(() => {
    if (viewport >= 7) return allDays;
    const cursorIdx = cursor.getDay();
    let start = Math.max(0, cursorIdx - Math.floor(viewport / 2));
    start = Math.min(start, 7 - viewport);
    return allDays.slice(start, start + viewport);
  }, [allDays, cursor, viewport]);

  const focusCursor = (day: Date) => {
    setCursor(day);
    requestAnimationFrame(() => cursorRef.current?.focus());
  };

  const today = new Date();

  return (
    <div
      ref={containerRef}
      className={cn("flex min-w-0 items-center gap-1", className)}
      style={{ maxWidth: 800 }}
    >
      <button
        type="button"
        aria-label="Previous week"
        onClick={() => focusCursor(addDaysLocal(cursor, -7))}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <div className="flex min-w-0 grow items-stretch gap-1">
        {displayDays.map((day) => {
          const isSelected = selected != null && sameDay(day, selected);
          const isToday = sameDay(day, today);
          const isCursor = sameDay(day, cursor);
          return (
            <button
              key={dayKey(day)}
              ref={isCursor ? cursorRef : undefined}
              type="button"
              tabIndex={isCursor ? 0 : -1}
              aria-label={day.toDateString()}
              data-active={isSelected}
              data-today={isToday}
              onClick={() => {
                setCursor(day);
                onChange(new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime());
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  focusCursor(addDaysLocal(cursor, -1));
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  focusCursor(addDaysLocal(cursor, 1));
                }
              }}
              className={cn(
                "flex h-[39px] min-w-[39px] shrink-0 grow basis-0 flex-col items-center justify-center rounded px-1 pb-px pt-0.5 text-[12px] font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                    ? "text-primary hover:bg-accent"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "text-[10px] leading-4 uppercase tracking-wide",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground/70",
                )}
              >
                {dense ? WEEKDAY_SHORT[day.getDay()]?.slice(0, 2) : WEEKDAY_SHORT[day.getDay()]}
              </span>
              <span className="mt-px text-[13px] leading-5 tabular-nums">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Next week"
        onClick={() => focusCursor(addDaysLocal(cursor, 7))}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};
