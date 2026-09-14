import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { NoteIcon } from "../../components/NoteIcon";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import { gcalService } from "../../di/container";
import type { GcalEvent, GcalEventInput } from "../../domain/gcal/GcalTypes";
import type { Note } from "../../domain/note/Note";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { openExternal } from "../../services/blocksuite/externalLinks";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { GcalCreateEventDialog } from "./GcalCreateEventDialog";
import { useGcalWindowEvents } from "./useGcalWindowEvents";

type DateField = "updatedAt" | "createdAt";

const FIELD_KEY = "cove-calendar-field";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const dayKey = (date: Date): string => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const keyOf = (timestamp: number): string => dayKey(new Date(timestamp));

const eventStartMs = (event: GcalEvent): number =>
  event.start.dateTime
    ? Date.parse(event.start.dateTime)
    : event.start.date
      ? new Date(`${event.start.date}T00:00:00`).getTime()
      : 0;

const eventEndMs = (event: GcalEvent): number =>
  event.end.dateTime
    ? Date.parse(event.end.dateTime)
    : event.end.date
      ? new Date(`${event.end.date}T00:00:00`).getTime()
      : 0;

const DAY_MS = 86_400_000;

const timeLabel = (event: GcalEvent): string => {
  if (!event.start.dateTime) return MESSAGES.GCAL_EVENT_ALL_DAY;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(event.start.dateTime),
  );
};

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

  const showGcal = useSettingsStore((s) => s.gcalShowEvents);
  const gcalStatus = useGcalStore((s) => s.status);
  const { events: gcalEvents, calendarId } = useGcalWindowEvents(
    cells[0] ?? monthCursor,
    cells[cells.length - 1] ?? monthCursor,
  );

  const [isAddEventOpen, setAddEventOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GcalEvent | null>(null);

  const selectedDayDate = useMemo(() => {
    if (!selectedDay) return new Date();
    const [y, m, d] = selectedDay.split("-").map(Number);
    return new Date(y ?? 0, m ?? 0, d ?? 1);
  }, [selectedDay]);

  const handleCreateEvent = async (input: GcalEventInput) => {
    setAddEventOpen(false);
    try {
      await gcalService.createEvent(calendarId, input);
      useNotificationStore.getState().pushToast({
        kind: "success",
        title: MESSAGES.GCAL_EVENT_CREATED_TOAST,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const handleDeleteEvent = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      await gcalService.deleteEvent(calendarId, target.id);
      useNotificationStore.getState().pushToast({
        kind: "info",
        title: MESSAGES.GCAL_EVENT_DELETED_TOAST,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const eventsByDay = useMemo(() => {
    const map = new Map<string, GcalEvent[]>();
    for (const event of gcalEvents) {
      const start = eventStartMs(event);
      const end = eventEndMs(event);
      const firstMidnight = new Date(start);
      firstMidnight.setHours(0, 0, 0, 0);
      for (
        let at = firstMidnight.getTime();
        at < end && at < firstMidnight.getTime() + 62 * DAY_MS;
        at += DAY_MS
      ) {
        const key = keyOf(at);
        const list = map.get(key) ?? [];
        list.push(event);
        map.set(key, list);
      }
    }
    return map;
  }, [gcalEvents]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  const todayKey = dayKey(new Date());
  const selectedNotes = selectedDay ? (notesByDay.get(selectedDay) ?? []) : [];
  const selectedEvents = selectedDay
    ? [...(eventsByDay.get(selectedDay) ?? [])].sort((a, b) => eventStartMs(a) - eventStartMs(b))
    : [];

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
          const hasEvents = showGcal && eventsByDay.has(key);
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
              <span aria-hidden="true" className="mt-0.5 flex h-1 items-center gap-0.5">
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    hasNotes ? "bg-muted-foreground/50" : "bg-transparent",
                  )}
                />
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    hasEvents ? "bg-primary" : "bg-transparent",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto border-t pt-2">
        {selectedNotes.length === 0 && selectedEvents.length === 0 ? (
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

        {gcalStatus === "reauth" && showGcal && (
          <p className="flex items-center gap-1.5 rounded-md border border-dashed px-2 py-1.5 text-[11px] leading-4 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {MESSAGES.GCAL_REAUTH_SHORT}
          </p>
        )}

        {showGcal && gcalStatus === "connected" && (selectedEvents.length > 0 || selectedDay) && (
          <div className="space-y-0.5 pt-1">
            <div className="flex items-center justify-between px-1 pb-0.5">
              <span className="text-[10px] font-semibold uppercase leading-4 tracking-widest text-muted-foreground">
                {MESSAGES.GCAL_AGENDA_TITLE}
              </span>
              <button
                type="button"
                aria-label={MESSAGES.GCAL_ADD_EVENT}
                title={MESSAGES.GCAL_ADD_EVENT}
                onClick={() => setAddEventOpen(true)}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            {selectedEvents.length === 0 && (
              <p className="px-1 py-1 text-xs text-muted-foreground/70">
                {MESSAGES.GCAL_NO_EVENTS}
              </p>
            )}
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className="group/event flex items-center gap-2 rounded-md px-2 py-1 text-[13px] leading-4 transition-colors hover:bg-accent/50"
              >
                <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {timeLabel(event)}
                </span>
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                </span>
                {event.extendedProperties?.private?.cove === "1" && (
                  <span className="shrink-0 rounded bg-primary/10 px-1 text-[9px] font-semibold uppercase text-primary">
                    {MESSAGES.GCAL_EVENT_COVE_BADGE}
                  </span>
                )}
                {event.hangoutLink && (
                  <button
                    type="button"
                    aria-label={MESSAGES.GCAL_EVENT_JOIN}
                    onClick={() => void openExternal(event.hangoutLink as string)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/event:opacity-100"
                  >
                    <Video className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
                {event.htmlLink && (
                  <button
                    type="button"
                    aria-label={MESSAGES.GCAL_EVENT_OPEN}
                    onClick={() => void openExternal(event.htmlLink as string)}
                    className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/event:opacity-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`${MESSAGES.GCAL_DELETE_EVENT}: ${event.summary ?? ""}`}
                  onClick={() => setDeleteTarget(event)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive focus-visible:opacity-100 group-hover/event:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <GcalCreateEventDialog
        open={isAddEventOpen}
        defaultDate={selectedDayDate}
        onConfirm={(input) => void handleCreateEvent(input)}
        onCancel={() => setAddEventOpen(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={MESSAGES.GCAL_DELETE_CONFIRM_TITLE}
        description={
          deleteTarget
            ? `"${deleteTarget.summary || MESSAGES.GCAL_EVENT_UNTITLED}" — ${MESSAGES.GCAL_DELETE_CONFIRM_DESC}`
            : MESSAGES.GCAL_DELETE_CONFIRM_DESC
        }
        confirmLabel={MESSAGES.GCAL_DELETE_EVENT}
        danger
        onConfirm={() => void handleDeleteEvent()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
