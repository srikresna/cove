import { CalendarDays, ListTodo, MapPin, MoreHorizontal, Video } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { getGcalCategory } from "../../domain/gcal/GcalCategory";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";
import { cn } from "../../lib/utils";
import { EventDetailPopover } from "./EventDetailPopover";
import {
  dayKey,
  eventEndMs,
  eventStartMs,
  formatClock24,
  isAllDay,
  timeRangeLabel,
} from "./gcalEventView";

const HOUR_HEIGHT = 64;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const colors = {
  event: { background: "#e0efff", border: "#c8e1fc", ink: "#173456", accent: "#4b91d7" },
  meeting: { background: "#efe3ff", border: "#dfccf8", ink: "#392455", accent: "#9166c4" },
  task: { background: "#ddf6e9", border: "#c7ead9", ink: "#1d4c39", accent: "#53a978" },
} as const;
const pastColor = { background: "#eeeeef", border: "#d4d4d8", ink: "#52525b", accent: "#71717a" };

const categoryIcons = { event: CalendarDays, meeting: Video, task: ListTodo } as const;

const placeEvents = (events: GcalAgendaEvent[]) => {
  const sorted = [...events].sort((a, b) => eventStartMs(a) - eventStartMs(b));
  const placed: Array<{ event: GcalAgendaEvent; lane: number; lanes: number }> = [];
  let group: typeof placed = [];
  let groupEnd = -Infinity;
  const flush = () => {
    const lanes = Math.max(1, ...group.map((item) => item.lane + 1));
    placed.push(...group.map((item) => ({ ...item, lanes })));
    group = [];
  };
  for (const event of sorted) {
    const start = eventStartMs(event);
    if (group.length > 0 && start >= groupEnd) flush();
    const used = new Set(
      group.filter((item) => eventEndMs(item.event) > start).map((item) => item.lane),
    );
    let lane = 0;
    while (used.has(lane)) lane++;
    group.push({ event, lane, lanes: 1 });
    groupEnd = Math.max(groupEnd, eventEndMs(event));
  }
  if (group.length > 0) flush();
  return placed;
};

interface TimeGridProps {
  days: Date[];
  events: GcalAgendaEvent[];
  onCreate: (date: Date) => void;
  onEdit: (event: GcalAgendaEvent) => void;
  onDuplicate: (event: GcalAgendaEvent) => void;
  onDelete: (event: GcalAgendaEvent) => void;
}

export const TimeGrid: React.FC<TimeGridProps> = ({
  days,
  events,
  onCreate,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const today = dayKey(now);
  const showNow = days.some((day) => dayKey(day) === today);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const initialHour = showNow ? Math.max(0, new Date().getHours() - 2) : 7;
      scrollRef.current.scrollTop = initialHour * HOUR_HEIGHT;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showNow]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const columns = `64px repeat(${days.length}, minmax(${days.length === 1 ? 240 : 132}px, 1fr))`;
  const nowMs = now.getTime();
  const nowTop = (now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600) * HOUR_HEIGHT;

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto border-t bg-background">
      <div className="sticky top-0 z-50 min-w-max border-b bg-background">
        <div className="grid" style={{ gridTemplateColumns: columns }}>
          <span className="border-r" />
          {days.map((day) => (
            <div
              key={dayKey(day)}
              className={cn(
                "border-r px-3 py-2 text-center last:border-r-0",
                dayKey(day) === today && "border-b-2 border-b-blue-500 bg-blue-50/60",
              )}
            >
              <span className="block font-mono text-[10px] font-semibold uppercase text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day)}
              </span>
              <span className={cn("text-lg font-medium", dayKey(day) === today && "text-primary")}>
                {day.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="grid border-t" style={{ gridTemplateColumns: columns }}>
          <span className="border-r px-1 py-2 text-center font-mono text-[9px] text-muted-foreground">
            All day
          </span>
          {days.map((day) => {
            const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
            const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
            return (
              <div key={dayKey(day)} className="min-h-8 border-r px-1 py-1 last:border-r-0">
                {events
                  .filter(
                    (event) =>
                      isAllDay(event) && eventStartMs(event) < end && eventEndMs(event) > start,
                  )
                  .map((event) => {
                    const category = getGcalCategory(event);
                    const color = eventEndMs(event) < now.getTime() ? pastColor : colors[category];
                    const Icon = categoryIcons[category];
                    return (
                      <EventDetailPopover
                        key={`${event.calendarId}:${event.id}`}
                        event={event}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                      >
                        <button
                          type="button"
                          className="relative mb-1 flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg border p-2 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{
                            backgroundColor: color.background,
                            borderColor: color.border,
                            color: color.ink,
                            boxShadow: `inset 0 0 0 2px #ffffffb8, 0 2px 6px #1d293914`,
                          }}
                        >
                          <span
                            className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                            style={{ backgroundColor: color.accent }}
                          >
                            <Icon size={14} />
                          </span>
                          <span className="relative z-10 min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-semibold">
                              {event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                            </span>
                            <span className="block text-[10px] opacity-80">All day</span>
                          </span>
                          <MoreHorizontal
                            size={15}
                            className="relative z-10 shrink-0 opacity-60"
                            aria-hidden="true"
                          />
                        </button>
                      </EventDetailPopover>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative grid min-w-max" style={{ gridTemplateColumns: columns }}>
        {showNow && (
          <div
            className="pointer-events-none absolute inset-x-0 z-30"
            style={{ top: nowTop }}
            data-testid="current-time-indicator"
          >
            <span className="absolute -top-3 left-1 flex h-6 w-14 items-center justify-center rounded-md border border-blue-400 bg-blue-50 font-mono text-[11px] font-bold text-blue-700 shadow-sm">
              {formatClock24(now)}
            </span>
            <span className="absolute left-16 right-0 top-0 h-px bg-blue-500" />
            <span className="absolute left-[60px] top-[-3px] h-2 w-2 rounded-full border border-white bg-blue-600" />
          </div>
        )}
        <div className="relative border-r" style={{ height: 24 * HOUR_HEIGHT }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute right-2 font-mono text-[10px] text-muted-foreground"
              style={{ top: hour * HOUR_HEIGHT + 4 }}
            >
              {`${String(hour).padStart(2, "0")}:00`}
            </div>
          ))}
        </div>
        {days.map((day) => {
          const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
          const end = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1).getTime();
          const visible = placeEvents(
            events.filter(
              (event) => !isAllDay(event) && eventStartMs(event) < end && eventEndMs(event) > start,
            ),
          );
          return (
            <div
              key={dayKey(day)}
              className={cn(
                "relative border-r last:border-r-0",
                dayKey(day) === today && "bg-primary/[0.025]",
              )}
              style={{ height: 24 * HOUR_HEIGHT }}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-0 left-0 border-t border-border/60"
                  style={{ top: hour * HOUR_HEIGHT }}
                >
                  <button
                    type="button"
                    className="block h-8 w-full text-left hover:bg-primary/5 focus-visible:bg-primary/10 focus-visible:outline-none"
                    aria-label={`Add schedule ${day.toDateString()} ${hour}:00`}
                    onClick={() =>
                      onCreate(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour))
                    }
                  />
                  <button
                    type="button"
                    className="block h-8 w-full text-left hover:bg-primary/5 focus-visible:bg-primary/10 focus-visible:outline-none"
                    aria-label={`Add schedule ${day.toDateString()} ${hour}:30`}
                    onClick={() =>
                      onCreate(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 30))
                    }
                  />
                </div>
              ))}
              {visible.map(({ event, lane, lanes }) => {
                const eventStart = new Date(Math.max(eventStartMs(event), start));
                const minutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                const duration = Math.max(
                  24,
                  Math.min(eventEndMs(event), end) - Math.max(eventStartMs(event), start),
                );
                const height = Math.max(24, (duration / 3_600_000) * HOUR_HEIGHT);
                const category = getGcalCategory(event);
                const completedTask =
                  category === "task" &&
                  event.extendedProperties?.private?.coveTaskCompleted === "1";
                const color =
                  eventEndMs(event) < nowMs || completedTask ? pastColor : colors[category];
                const Icon = categoryIcons[category];
                const roomy = height >= 90;
                const compact = height < 48;
                const isCurrentEvent =
                  showNow &&
                  dayKey(day) === today &&
                  eventStartMs(event) <= nowMs &&
                  nowMs < eventEndMs(event);
                return (
                  <div
                    key={`${event.calendarId}:${event.id}`}
                    className="absolute z-10"
                    style={{
                      top: (minutes / 60) * HOUR_HEIGHT,
                      height,
                      left: `calc(${(lane / lanes) * 100}% + 4px)`,
                      width: `calc(${100 / lanes}% - 8px)`,
                    }}
                  >
                    <EventDetailPopover
                      event={event}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    >
                      <button
                        type="button"
                        className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border px-2.5 py-1.5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{
                          backgroundColor: color.background,
                          borderColor: color.border,
                          color: color.ink,
                          boxShadow: `inset 0 0 0 2px #ffffffb8, 0 2px 6px #1d293914`,
                          filter:
                            eventEndMs(event) < nowMs || completedTask ? "grayscale(1)" : undefined,
                          outline: isCurrentEvent ? "2px solid #60a5fa" : undefined,
                          outlineOffset: isCurrentEvent ? 1 : undefined,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-5 -top-7 h-20 w-20 rounded-full border-2 opacity-30"
                          style={{ borderColor: color.accent }}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-8 top-4 h-16 w-16 rounded-full border opacity-20"
                          style={{ borderColor: color.accent }}
                        />
                        {roomy && (
                          <span
                            className="relative mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                            style={{ backgroundColor: color.accent }}
                          >
                            <Icon size={15} />
                          </span>
                        )}
                        <span className="relative flex w-full min-w-0 items-center gap-1.5 text-[11px] font-semibold leading-4">
                          {!roomy && !compact && (
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white"
                              style={{ backgroundColor: color.accent }}
                            >
                              <Icon size={12} />
                            </span>
                          )}
                          <span className="line-clamp-2 min-w-0">
                            {event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                          </span>
                        </span>
                        {!compact && (
                          <span className="relative mt-0.5 block w-full truncate font-mono text-[10px] opacity-80">
                            {timeRangeLabel(event)}
                          </span>
                        )}
                        {roomy && event.location && (
                          <span className="relative mt-1 flex w-full items-center gap-1 truncate text-[10px] opacity-75">
                            <MapPin size={10} className="shrink-0" />
                            {event.location}
                          </span>
                        )}
                        {roomy && (
                          <MoreHorizontal
                            size={15}
                            className="absolute bottom-2 right-2 opacity-60"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </EventDetailPopover>
                  </div>
                );
              })}
              {showNow &&
                dayKey(day) === today &&
                visible
                  .filter(({ event }) => eventStartMs(event) <= nowMs && nowMs < eventEndMs(event))
                  .map(({ event, lane, lanes }) => (
                    <div
                      key={`now:${event.calendarId}:${event.id}`}
                      data-testid="current-event-bracket"
                      className="pointer-events-none absolute z-40 h-4 -translate-y-1/2"
                      style={{
                        top: nowTop,
                        left: `calc(${(lane / lanes) * 100}% + 4px)`,
                        width: `calc(${100 / lanes}% - 8px)`,
                        borderLeft: "3px solid #2563eb",
                        borderRight: "3px solid #2563eb",
                      }}
                    />
                  ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
