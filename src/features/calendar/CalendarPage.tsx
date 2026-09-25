import { CalendarPlus, ChevronLeft, ChevronRight, Plug } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import { gcalService } from "../../di/container";
import {
  type GcalCategory,
  type GcalCategoryFilter,
  getGcalCategory,
} from "../../domain/gcal/GcalCategory";
import type { GcalAgendaEvent, GcalEventInput } from "../../domain/gcal/GcalTypes";
import type { Note } from "../../domain/note/Note";
import { useGcalWindowEvents } from "../../hooks/useGcalWindowEvents";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { GcalCreateEventDialog } from "../editor/GcalCreateEventDialog";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { AgendaList } from "./AgendaList";
import { CalendarPickerMenu } from "./CalendarPickerMenu";
import { buildWeeks, dayKey, eventStartMs, shiftEventDates } from "./gcalEventView";
import { MonthGrid } from "./MonthGrid";
import { TimeGrid } from "./TimeGrid";

type CalendarView = "day" | "week" | "month" | "agenda";
type NoteField = "updatedAt" | "createdAt";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FIELD_KEY = "cove-calendar-field";

const isNoteField = (value: string): value is NoteField =>
  value === "updatedAt" || value === "createdAt";

export const CalendarPage: React.FC = () => {
  const gcalStatus = useGcalStore((s) => s.status);
  const calendars = useGcalStore((s) => s.calendars);
  const selectedCalendarIds = useGcalStore((s) => s.selectedCalendarIds);
  const syncFailed = useGcalStore((s) => s.syncFailed);

  const notes = useNotes();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const [view, setView] = useState<CalendarView>("week");
  const [categoryFilter, setCategoryFilter] = useState<GcalCategoryFilter>("all");
  const [newCategory, setNewCategory] = useState<GcalCategory>("event");
  const [newDate, setNewDate] = useState(() => new Date());
  const [noteField, setNoteField] = useState<NoteField>(() => {
    const stored = localStorage.getItem(FIELD_KEY) ?? "";
    return isNoteField(stored) ? stored : "updatedAt";
  });
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [isAddOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GcalAgendaEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GcalAgendaEvent | null>(null);

  const weeks = useMemo(() => buildWeeks(monthCursor), [monthCursor]);
  const weekStart = useMemo(() => {
    const start = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      monthCursor.getDate(),
    );
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
  }, [monthCursor]);
  const visibleDays = useMemo(() => {
    const first =
      view === "day"
        ? new Date(monthCursor.getFullYear(), monthCursor.getMonth(), monthCursor.getDate())
        : weekStart;
    return Array.from(
      { length: view === "day" ? 1 : 7 },
      (_, offset) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + offset),
    );
  }, [view, monthCursor, weekStart]);
  const windowStart =
    view === "day" || view === "week" ? (visibleDays[0] ?? weekStart) : (weeks[0] ?? monthCursor);
  const windowEndDate = useMemo(() => {
    if (view === "day" || view === "week") {
      const last = visibleDays[visibleDays.length - 1] ?? monthCursor;
      return new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    }
    const last = weeks[weeks.length - 1] ?? monthCursor;
    return new Date(last.getFullYear(), last.getMonth(), last.getDate() + 7);
  }, [weeks, monthCursor, view, visibleDays]);

  const { events, createCalendarId } = useGcalWindowEvents(windowStart, windowEndDate);
  const filteredEvents = useMemo(
    () =>
      categoryFilter === "all"
        ? events
        : events.filter((event) => getGcalCategory(event) === categoryFilter),
    [events, categoryFilter],
  );

  const notesByDay = useMemo(() => {
    const map = new Map<string, Note[]>();
    for (const note of notes) {
      if (note.workspaceId !== activeWorkspaceId || note.isTemplate) continue;
      const key = dayKey(new Date(note[noteField]));
      const list = map.get(key) ?? [];
      list.push(note);
      map.set(key, list);
    }
    return map;
  }, [notes, activeWorkspaceId, noteField]);
  const visibleNotesByDay = useMemo(
    () => (categoryFilter === "all" ? notesByDay : new Map<string, Note[]>()),
    [categoryFilter, notesByDay],
  );

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  const connected = gcalStatus === "connected";

  const openCreate = (
    date: Date,
    category: GcalCategory = categoryFilter === "all" ? "event" : categoryFilter,
  ) => {
    setNewDate(date);
    setNewCategory(category);
    setAddOpen(true);
  };

  const shiftRange = (direction: number) => {
    const next = new Date(monthCursor);
    if (view === "month" || view === "agenda") next.setMonth(next.getMonth() + direction);
    else next.setDate(next.getDate() + direction * (view === "week" ? 7 : 1));
    setMonthCursor(next);
  };

  const rangeLabel =
    view === "day"
      ? new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(monthCursor)
      : view === "week"
        ? `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(visibleDays[0] ?? monthCursor)} – ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(visibleDays[6] ?? monthCursor)}`
        : monthLabel;

  const chooseNoteField = (next: NoteField) => {
    setNoteField(next);
    localStorage.setItem(FIELD_KEY, next);
  };

  const handleCreate = async (input: GcalEventInput, calendarId: string) => {
    setAddOpen(false);
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

  const handleEdit = async (input: GcalEventInput, calendarId: string) => {
    const target = editTarget;
    setEditTarget(null);
    if (!target) return;
    try {
      await gcalService.updateEvent(calendarId || target.calendarId, target.id, {
        summary: input.summary,
        description: input.description,
        location: input.location,
        start: input.start,
        end: input.end,
        extendedProperties: input.extendedProperties,
      });
      useNotificationStore.getState().pushToast({
        kind: "success",
        title: MESSAGES.GCAL_EVENT_UPDATED_TOAST,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const handleDuplicate = async (event: GcalAgendaEvent) => {
    try {
      await gcalService.createEvent(event.calendarId, {
        id: crypto.randomUUID().replaceAll("-", ""),
        summary: event.summary ?? "",
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        extendedProperties: event.extendedProperties,
      });
      useNotificationStore.getState().pushToast({
        kind: "success",
        title: MESSAGES.GCAL_DUPLICATED_TOAST,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const handleDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      await gcalService.deleteEvent(target.calendarId, target.id);
      useNotificationStore.getState().pushToast({
        kind: "info",
        title: MESSAGES.GCAL_EVENT_DELETED_TOAST,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const handleReschedule = async (event: GcalAgendaEvent, deltaDays: number) => {
    if (event.id.includes("_")) {
      useNotificationStore.getState().pushToast({
        kind: "info",
        title: MESSAGES.GCAL_DRAG_RECURRING,
      });
      return;
    }
    const { start, end } = shiftEventDates(event, deltaDays);
    try {
      await gcalService.updateEvent(event.calendarId, event.id, {
        summary: event.summary ?? "",
        description: event.description,
        location: event.location,
        start,
        end,
      });
    } catch (err) {
      notifyError(err);
    }
  };

  const selectableCalendars = useMemo(
    () => calendars.filter((calendar) => selectedCalendarIds.includes(calendar.id)),
    [calendars, selectedCalendarIds],
  );

  return (
    <div className="cove-doc-scroll flex h-full flex-col overflow-hidden">
      <div className="flex min-h-14 flex-shrink-0 flex-wrap items-center gap-2 border-b px-5 py-2">
        <h1 className="font-display text-lg font-medium tracking-tight text-foreground">
          {MESSAGES.NAV_CALENDAR}
        </h1>
        {syncFailed && connected && (
          <span className="font-mono text-[10px] leading-4 text-muted-foreground/60">
            ({MESSAGES.GCAL_SYNC_FAILED})
          </span>
        )}

        <span className="flex-1" />

        {connected ? (
          <>
            <CalendarPickerMenu className="rounded-md border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <Button size="sm" onClick={() => openCreate(new Date())}>
              <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.GCAL_ADD_EVENT}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>
            <Plug className="h-3.5 w-3.5" aria-hidden="true" />
            {MESSAGES.GCAL_CONNECT}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b px-5 py-2">
        {(
          [
            ["all", "All Scheduled"],
            ["event", "Events"],
            ["meeting", "Meetings"],
            ["task", "Task Reminders"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={categoryFilter === value}
            onClick={() => setCategoryFilter(value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              categoryFilter === value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b px-5 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Previous period"
            onClick={() => shiftRange(-1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="min-w-[165px] text-center text-[13px] font-medium leading-4 text-foreground">
            {rangeLabel}
          </span>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Next period"
            onClick={() => shiftRange(1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMonthCursor(new Date())}>
            {MESSAGES.CAL_TODAY}
          </Button>
        </div>
        <span className="flex-1" />
        <div className="flex items-center gap-1 rounded-lg border bg-muted/60 p-0.5">
          {(
            [
              ["day", "Day"],
              ["week", "Week"],
              ["month", MESSAGES.CAL_VIEW_MONTH],
              ["agenda", MESSAGES.CAL_VIEW_AGENDA],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                view === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <input
          type="date"
          aria-label="Jump to date"
          value={`${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}-${String(monthCursor.getDate()).padStart(2, "0")}`}
          onChange={(event) => {
            if (event.target.value) setMonthCursor(new Date(`${event.target.value}T12:00:00`));
          }}
          className="h-8 rounded-md border bg-background px-2 font-mono text-xs text-foreground"
        />
        <div className="flex items-center gap-1">
          {(
            [
              ["updatedAt", MESSAGES.CALENDAR_FILTER_UPDATED],
              ["createdAt", MESSAGES.CALENDAR_FILTER_CREATED],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={noteField === value}
              onClick={() => chooseNoteField(value)}
              title={MESSAGES.CAL_NOTE_FIELD_HINT}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase leading-4 tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                noteField === value
                  ? "border-border bg-card text-foreground shadow-sm"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "day" || view === "week" ? (
        <TimeGrid
          days={visibleDays}
          events={filteredEvents}
          onCreate={(date) => openCreate(date)}
          onEdit={setEditTarget}
          onDuplicate={(event) => void handleDuplicate(event)}
          onDelete={setDeleteTarget}
        />
      ) : view === "month" ? (
        <MonthGrid
          weeks={weeks}
          monthCursor={monthCursor}
          events={filteredEvents}
          onCreate={(date) => openCreate(date)}
          onOpenNote={setActiveNoteId}
          notesByDay={visibleNotesByDay}
          onEdit={setEditTarget}
          onDuplicate={(event) => void handleDuplicate(event)}
          onDelete={setDeleteTarget}
          onReschedule={(event, deltaDays) => void handleReschedule(event, deltaDays)}
          weekdays={WEEKDAYS}
        />
      ) : (
        <AgendaList
          events={[...filteredEvents].sort((a, b) => eventStartMs(a) - eventStartMs(b))}
          notesByDay={visibleNotesByDay}
          noteField={noteField}
          onOpenNote={(noteId) => setActiveNoteId(noteId)}
          onEdit={setEditTarget}
          onDuplicate={(event) => void handleDuplicate(event)}
          onDelete={setDeleteTarget}
        />
      )}

      <GcalCreateEventDialog
        open={isAddOpen}
        defaultDate={newDate}
        defaultCategory={newCategory}
        calendars={selectableCalendars}
        defaultCalendarId={createCalendarId}
        onConfirm={(input, calendarId) => void handleCreate(input, calendarId)}
        onCancel={() => setAddOpen(false)}
      />

      {editTarget && (
        <GcalCreateEventDialog
          open
          editing={editTarget}
          defaultDate={new Date()}
          calendars={selectableCalendars}
          defaultCalendarId={editTarget.calendarId}
          onConfirm={(input, calendarId) => void handleEdit(input, calendarId)}
          onCancel={() => setEditTarget(null)}
        />
      )}

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
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
