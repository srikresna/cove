import { CalendarCheck, ChevronLeft, ChevronRight, FileText, Plus, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { journalService } from "../../di/container";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";

type DateField = "journal" | "updatedAt" | "createdAt";

const FIELD_KEY = "cove-calendar-field";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const dayKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const keyOf = (timestamp: number): string => dayKey(new Date(timestamp));

const isDateField = (value: string): value is DateField =>
  value === "journal" || value === "updatedAt" || value === "createdAt";

export const CalendarPanel: React.FC = () => {
  const notes = useNoteStore((s) => s.notes);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const propertyVersion = usePropertyStore((s) => s.version);

  const [field, setField] = useState<DateField>(() => {
    const stored = localStorage.getItem(FIELD_KEY) ?? "";
    return isDateField(stored) ? stored : "journal";
  });
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(() => dayKey(new Date()));
  const [journalByNoteId, setJournalByNoteId] = useState<Map<string, number>>(new Map());

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    let alive = true;
    journalService
      .journalValuesByNote()
      .then((values) => {
        if (!alive) return;
        const map = new Map<string, number>();
        for (const [noteId, value] of values) {
          if (value.type === "date") map.set(noteId, value.timestamp);
        }
        setJournalByNoteId(map);
      })
      .catch(() => {
        if (alive) setJournalByNoteId(new Map());
      });
    return () => {
      alive = false;
    };
  }, [propertyVersion]);

  const notesByDay = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const note of workspaceNotes) {
      let timestamp: number | undefined;
      if (field === "journal") {
        timestamp = journalByNoteId.get(note.id);
      } else {
        timestamp = note[field];
      }
      if (timestamp === undefined) continue;
      const key = keyOf(timestamp);
      const list = map.get(key) ?? [];
      list.push(note);
      map.set(key, list);
    }
    return map;
  }, [workspaceNotes, field, journalByNoteId]);

  const cells = useMemo(() => {
    // Full 6-week grid; adjacent-month days render faded (and clickable), no leading blanks.
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
  // Journal notes sharing the selected day (conflict block input).
  const journalNotesForSelected = useMemo(() => {
    if (!selectedDay) return [];
    return workspaceNotes.filter((n) => {
      const ts = journalByNoteId.get(n.id);
      return ts != null && keyOf(ts) === selectedDay;
    });
  }, [workspaceNotes, journalByNoteId, selectedDay]);

  const removeJournalMark = (noteId: string) => {
    journalService
      .removeJournalDate(noteId)
      .then(() => {
        usePropertyStore.getState().refresh();
      })
      .catch(notifyError);
  };

  const shiftMonth = (delta: number) =>
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const chooseField = (next: DateField) => {
    setField(next);
    localStorage.setItem(FIELD_KEY, next);
  };

  const dateOfSelectedDay = selectedDay
    ? new Date(
        Number(selectedDay.split("-")[0]),
        Number(selectedDay.split("-")[1]),
        Number(selectedDay.split("-")[2]),
      )
    : null;

  const openJournalFor = useCallback(
    (date: Date) => {
      if (!activeWorkspaceId) return;
      journalService
        .ensureJournalByDate(activeWorkspaceId, date.getTime())
        .then(async (noteId) => {
          // The service bypasses the stores, so refresh both before pointing
          // the UI at the (possibly just-created) journal note.
          usePropertyStore.getState().refresh();
          await useNoteStore.getState().refreshNotesInPlace(activeWorkspaceId);
          setSelectedDay(dayKey(date));
          setActiveNoteId(noteId);
        })
        .catch(notifyError);
    },
    [activeWorkspaceId, setActiveNoteId],
  );

  const handleDayClick = (key: string, hasNotes: boolean) => {
    // Day click only selects; the New-journal-note row/button is the single creation path.
    void hasNotes;
    setSelectedDay((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3">
      <div className="flex items-center justify-between pt-2">
        <span className="text-[13px] font-semibold text-foreground">{monthLabel}</span>
        <div className="flex items-center">
          {field === "journal" && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={MESSAGES.JOURNAL_TODAY}
              title={MESSAGES.JOURNAL_TODAY}
              onClick={() => openJournalFor(new Date())}
              className="mr-1 h-7 gap-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.JOURNAL_TODAY}
            </Button>
          )}
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
            ["journal", MESSAGES.JOURNAL_FIELD],
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
          // Typed dots: journal = primary, activity (created/updated) = muted.
          // In journal mode notesByDay is keyed by the same journal-day
          // predicate, so hasNotes already answers this — no per-cell rescan.
          const journalDay = field === "journal" && hasNotes;
          return (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed 42-cell grid with duplicate day keys across months
              key={`${key}-${index}`}
              type="button"
              onClick={() => handleDayClick(key, hasNotes)}
              aria-pressed={isSelected}
              title={!hasNotes && field === "journal" ? MESSAGES.JOURNAL_NEW : undefined}
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
                  journalDay
                    ? "bg-primary"
                    : hasNotes
                      ? "bg-muted-foreground/50"
                      : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto border-t pt-2">
        {/* Journal conflict block: >1 journal notes sharing the selected day. */}
        {field === "journal" && dateOfSelectedDay && journalNotesForSelected.length > 1 && (
          <div className="space-y-0.5">
            {journalNotesForSelected.map((note, index) => (
              <div key={note.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveNoteId(note.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span aria-hidden="true" className="shrink-0 text-sm">
                    {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                  </span>
                  <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
                  {index > 0 && (
                    <span className="ml-1 shrink-0 rounded border border-destructive/40 bg-destructive/10 px-1.5 text-[10px] text-destructive">
                      {MESSAGES.JOURNAL_CONFLICT}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  aria-label={MESSAGES.JOURNAL_REMOVE_MARK}
                  title={MESSAGES.JOURNAL_REMOVE_MARK}
                  onClick={() => removeJournalMark(note.id)}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedNotes.length === 0 ? (
          field === "journal" && dateOfSelectedDay && activeWorkspaceId ? (
            <button
              type="button"
              onClick={() => openJournalFor(dateOfSelectedDay)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{MESSAGES.JOURNAL_NEW}</span>
            </button>
          ) : (
            <p className="px-1 py-3 text-center text-xs text-muted-foreground">
              {MESSAGES.CALENDAR_EMPTY_DAY}
            </p>
          )
        ) : (
          selectedNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setActiveNoteId(note.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true" className="shrink-0 text-sm">
                {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
              </span>
              <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
