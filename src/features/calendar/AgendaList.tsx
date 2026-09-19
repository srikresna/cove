import { NotebookPen } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { MESSAGES } from "../../constants/messages";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";
import { cn } from "../../lib/utils";
import { noteActions } from "../../store/noteActions";
import { notifyError } from "../../store/notify";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { EventDetailPopover } from "./EventDetailPopover";
import { dayKey, eventDayKeys, timeLabel } from "./gcalEventView";

interface AgendaListProps {
  events: GcalAgendaEvent[];
  onEdit: (event: GcalAgendaEvent) => void;
  onDuplicate: (event: GcalAgendaEvent) => void;
  onDelete: (event: GcalAgendaEvent) => void;
}

export const AgendaList: React.FC<AgendaListProps> = ({
  events,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const createDayNote = (date: Date) => {
    if (!activeWorkspaceId) return;
    const title = `Notes — ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)}`;
    try {
      void noteActions.createNote(activeWorkspaceId, title);
    } catch (err) {
      notifyError(err);
    }
  };

  const byDay = useMemo(() => {
    const map = new Map<string, GcalAgendaEvent[]>();
    for (const event of events) {
      for (const key of eventDayKeys(event)) {
        const list = map.get(key) ?? [];
        list.push(event);
        map.set(key, list);
      }
    }
    return [...map.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  }, [events]);

  const todayKey = dayKey(new Date());

  if (events.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-[13px] text-muted-foreground">{MESSAGES.GCAL_NO_EVENTS}</p>
      </div>
    );
  }

  return (
    <div className="cove-doc-scroll min-h-0 flex-1 overflow-y-auto px-6 pb-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-6">
        {byDay.map(([key, dayEvents]) => {
          const [year, month, day] = key.split("-").map(Number);
          const date = new Date(year ?? 0, month ?? 0, day ?? 1);
          const isToday = key === todayKey;
          return (
            <section key={key}>
              <div className="flex items-baseline gap-2.5 pb-2">
                <h3
                  className={cn(
                    "font-mono text-[11px] font-semibold uppercase leading-4 tracking-widest",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date)}
                </h3>
                <span
                  className={cn(
                    "text-[13px] leading-5",
                    isToday ? "font-medium text-primary" : "text-muted-foreground",
                  )}
                >
                  {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
                    date,
                  )}
                </span>
                {isToday && (
                  <span className="font-mono text-[9px] uppercase leading-4 tracking-widest text-primary/70">
                    {MESSAGES.CAL_TODAY}
                  </span>
                )}
                <span className="flex-1" />
                <button
                  type="button"
                  onClick={() => createDayNote(date)}
                  aria-label={MESSAGES.GCAL_NOTE_FOR_DAY}
                  title={MESSAGES.GCAL_NOTE_FOR_DAY}
                  className="rounded p-1 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <ul className="space-y-0.5">
                {dayEvents.map((event) => (
                  <li key={`${event.calendarId}:${event.id}`}>
                    <EventDetailPopover
                      event={event}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span
                          className="w-16 shrink-0 text-right font-mono text-[11px] leading-4"
                          style={{ color: event.calendarColor ?? undefined }}
                        >
                          {timeLabel(event)}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: event.calendarColor ?? "transparent" }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-foreground">
                          {event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                        </span>
                        {event.location && (
                          <span className="hidden max-w-[160px] shrink-0 truncate text-[11px] leading-4 text-muted-foreground/70 md:block">
                            {event.location}
                          </span>
                        )}
                      </button>
                    </EventDetailPopover>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};
