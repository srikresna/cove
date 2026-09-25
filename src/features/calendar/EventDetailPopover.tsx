import {
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  MapPin,
  NotebookPen,
  Pencil,
  Trash2,
  Video,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { MESSAGES } from "../../constants/messages";
import { gcalService } from "../../di/container";
import {
  getGcalCategory,
  isGcalTaskCompleted,
  withGcalTaskCompleted,
} from "../../domain/gcal/GcalCategory";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";
import { openExternal } from "../../services/blocksuite/externalLinks";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { longDateLabel, timeRangeLabel } from "./gcalEventView";

interface EventDetailPopoverProps {
  event: GcalAgendaEvent;
  onEdit: (event: GcalAgendaEvent) => void;
  onDuplicate: (event: GcalAgendaEvent) => void;
  onDelete: (event: GcalAgendaEvent) => void;
  children: React.ReactElement;
}

export const EventDetailPopover: React.FC<EventDetailPopoverProps> = ({
  event,
  onEdit,
  onDuplicate,
  onDelete,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const calendars = useGcalStore((s) => s.calendars);
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const calendar = calendars.find((entry) => entry.id === event.calendarId);
  const linkedNoteId = event.extendedProperties?.private?.coveNoteId;
  const isTask = getGcalCategory(event) === "task";
  const taskCompleted = isGcalTaskCompleted(event);

  const toggleTaskCompleted = async () => {
    try {
      await gcalService.updateEvent(event.calendarId, event.id, {
        summary: event.summary ?? "",
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        extendedProperties: withGcalTaskCompleted(event, !taskCompleted).extendedProperties,
      });
      useNotificationStore.getState().pushToast({
        kind: "success",
        title: taskCompleted ? "Task reopened" : "Task completed",
      });
      setOpen(false);
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-4">
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: event.calendarColor ?? "transparent" }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 font-medium text-foreground">
              {event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
            </p>
            <p className="mt-1 font-mono text-[11px] leading-4 text-muted-foreground">
              {timeRangeLabel(event)}
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              {calendar?.summary || calendar?.id}
            </p>
          </div>
          {event.extendedProperties?.private?.cove === "1" && (
            <span className="shrink-0 rounded bg-primary/10 px-1 text-[9px] font-semibold uppercase text-primary">
              {getGcalCategory(event) === "task"
                ? "Task reminder"
                : getGcalCategory(event) === "meeting"
                  ? "Meeting"
                  : MESSAGES.GCAL_EVENT_COVE_BADGE}
            </span>
          )}
        </div>

        {isTask && (
          <button
            type="button"
            onClick={() => void toggleTaskCompleted()}
            className="mt-3 flex w-full items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {taskCompleted ? "Mark task as active" : "Mark task as complete"}
          </button>
        )}

        {event.location && (
          <button
            type="button"
            onClick={() =>
              void openExternal(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location ?? "")}`,
              )
            }
            className="mt-3 flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-[13px] leading-5 text-foreground transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </button>
        )}

        {event.description && (
          <p className="mt-2 border-t pt-2 text-[12px] leading-5 text-muted-foreground">
            {event.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1 border-t pt-2">
          {linkedNoteId && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setActiveNoteId(linkedNoteId);
              }}
              aria-label={MESSAGES.GCAL_OPEN_LINKED_NOTE}
              title={MESSAGES.GCAL_OPEN_LINKED_NOTE}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          {event.hangoutLink && (
            <button
              type="button"
              onClick={() => void openExternal(event.hangoutLink as string)}
              aria-label={MESSAGES.GCAL_EVENT_JOIN}
              title={MESSAGES.GCAL_EVENT_JOIN}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Video className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          {event.htmlLink && (
            <button
              type="button"
              onClick={() => void openExternal(event.htmlLink as string)}
              aria-label={MESSAGES.GCAL_EVENT_OPEN}
              title={MESSAGES.GCAL_EVENT_OPEN}
              className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit(event);
            }}
            aria-label={MESSAGES.GCAL_EDIT_EVENT_TITLE}
            title={MESSAGES.GCAL_EDIT_EVENT_TITLE}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDuplicate(event);
            }}
            aria-label={MESSAGES.GCAL_DUPLICATE_EVENT}
            title={MESSAGES.GCAL_DUPLICATE_EVENT}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(event);
            }}
            aria-label={MESSAGES.GCAL_DELETE_EVENT}
            title={MESSAGES.GCAL_DELETE_EVENT}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase leading-4 tracking-widest text-muted-foreground/50">
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          {longDateLabel(new Date(event.start.dateTime ?? `${event.start.date}T00:00:00`))}
        </p>
      </PopoverContent>
    </Popover>
  );
};
