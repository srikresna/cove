import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { NoteIcon } from "../../components/NoteIcon";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

type DateField = "updatedAt" | "createdAt";

const FIELD_KEY = "cove-calendar-field";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const dayKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const keyOf = (timestamp: number): string => dayKey(new Date(timestamp));

const isDateField = (value: string): value is DateField =>
  value === "updatedAt" || value === "createdAt";

export const CalendarPanel: React.FC = () => {
  const notes = useNotes();
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const [field, setField] = useState<DateField>(() => {
    const stored = localStorage.getItem(FIELD_KEY) ?? "";
    return isDateField(stored) ? stored : "updatedAt";
  });
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(() => dayKey(new Date()));

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );

  const notesByDay = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const note of workspaceNotes) {
      const timestamp = note[field];
      const key = keyOf(timestamp);
      const list = map.get(key) ?? [];
      list.push(note);
      map.set(key, list);
    }
    return map;
  }, [workspaceNotes, field]);

  const cells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const start = new Date(year, month, 1 - firstOfMonth.getDay());
    const list: Date[] = [];
    for (let i = 0; i < 42; i++) {
      list.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return list;
  }, [monthCursor]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  const todayKey = dayKey(new Date());
  const selectedNotes = selectedDay ? (notesByDay.get(selectedDay) ?? []) : [];

  const shiftMonth = (delta: number) =>
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const chooseField = (next: DateField) => {
    setField(next);
    localStorage.setItem(FIELD_KEY, next);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3">
      <div className="flex items-center justify-between pt-2">
        <span className="text-[13px] font-semibold leading-4 text-foreground">{monthLabel}</span>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="mt-1 flex gap-1">
        {(
          [
            ["updatedAt", MESSAGES.CALENDAR_FILTER_UPDATED],
            ["createdAt", MESSAGES.CALENDAR_FILTER_CREATED],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={field === value}
            onClick={() => chooseField(value)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              field === value
                ? "border-border bg-card text-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 text-center">
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
          const hasNotes = notesByDay.has(key);
          const isSelected = key === selectedDay;
          const notCurrentMonth = date.getMonth() !== monthCursor.getMonth();
          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed 42-cell grid with duplicate day keys across months
              key={`${key}-${index}`}
              type="button"
              onClick={() => setSelectedDay((prev) => (prev === key ? null : key))}
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
                  hasNotes ? "bg-muted-foreground/50" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto border-t pt-2">
        {selectedNotes.length === 0 ? (
          <p className="px-1 py-3 text-center text-xs text-muted-foreground">
            {MESSAGES.CALENDAR_EMPTY_DAY}
          </p>
        ) : (
          selectedNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveNoteId(note.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] leading-4 text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true" className="shrink-0 text-sm">
                <NoteIcon icon={note.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
