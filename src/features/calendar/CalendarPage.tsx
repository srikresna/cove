import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import { gcalService } from "../../di/container";
import type { GcalAgendaEvent, GcalEventInput } from "../../domain/gcal/GcalTypes";
import { useGcalWindowEvents } from "../../hooks/useGcalWindowEvents";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { GcalCreateEventDialog } from "../editor/GcalCreateEventDialog";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { AgendaList } from "./AgendaList";
import { CalendarPickerMenu } from "./CalendarPickerMenu";
import { buildWeeks, eventStartMs, shiftEventDates } from "./gcalEventView";
import { MonthGrid } from "./MonthGrid";

type CalendarView = "month" | "agenda";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarPage: React.FC = () => {
  const gcalStatus = useGcalStore((s) => s.status);
  const calendars = useGcalStore((s) => s.calendars);
  const selectedCalendarIds = useGcalStore((s) => s.selectedCalendarIds);
  const syncFailed = useGcalStore((s) => s.syncFailed);

  const [view, setView] = useState<CalendarView>("month");
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isAddOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GcalAgendaEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GcalAgendaEvent | null>(null);

  const weeks = useMemo(() => buildWeeks(monthCursor), [monthCursor]);
  const windowStart = weeks[0] ?? monthCursor;
  const windowEndDate = useMemo(() => {
    const last = weeks[weeks.length - 1] ?? monthCursor;
    return new Date(last.getFullYear(), last.getMonth(), last.getDate() + 7);
  }, [weeks, monthCursor]);

  const { events, createCalendarId } = useGcalWindowEvents(windowStart, windowEndDate);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthCursor);

  const connected = gcalStatus === "connected";

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
      <div className="flex h-14 flex-shrink-0 items-center gap-3 border-b px-5">
        <h1 className="font-display text-lg font-medium tracking-tight text-foreground">
          {MESSAGES.NAV_CALENDAR}
        </h1>
        <span aria-hidden="true" className="waterline h-5 w-px opacity-70" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Previous month"
            onClick={() =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="min-w-[150px] text-center text-[13px] font-medium leading-4 text-foreground">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="iconSm"
            aria-label="Next month"
            onClick={() =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
            className="text-muted-foreground"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const now = new Date();
              setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            className="text-muted-foreground"
          >
            {MESSAGES.CAL_TODAY}
          </Button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-muted/60 p-0.5">
          {(
            [
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

        {syncFailed && connected && (
          <span className="font-mono text-[10px] leading-4 text-muted-foreground/60">
            ({MESSAGES.GCAL_SYNC_FAILED})
          </span>
        )}

        <span className="flex-1" />

        {connected && (
          <CalendarPickerMenu className="rounded-md border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        )}
        {connected && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
            {MESSAGES.GCAL_ADD_EVENT}
          </Button>
        )}
      </div>

      {!connected ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <h2 className="font-display text-lg font-medium text-foreground">
              {MESSAGES.HOME_CONNECT_CALENDAR}
            </h2>
            <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
              {MESSAGES.GCAL_DISCONNECTED_DESC}
            </p>
          </div>
        </div>
      ) : view === "month" ? (
        <MonthGrid
          weeks={weeks}
          monthCursor={monthCursor}
          events={events}
          onEdit={setEditTarget}
          onDuplicate={(event) => void handleDuplicate(event)}
          onDelete={setDeleteTarget}
          onReschedule={(event, deltaDays) => void handleReschedule(event, deltaDays)}
          weekdays={WEEKDAYS}
        />
      ) : (
        <AgendaList
          events={[...events].sort((a, b) => eventStartMs(a) - eventStartMs(b))}
          onEdit={setEditTarget}
          onDuplicate={(event) => void handleDuplicate(event)}
          onDelete={setDeleteTarget}
        />
      )}

      <GcalCreateEventDialog
        open={isAddOpen}
        defaultDate={new Date()}
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
