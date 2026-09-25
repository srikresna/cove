import { CalendarDays, ListTodo, NotebookPen, Video } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { MESSAGES } from "../../constants/messages";
import { getGcalCategory } from "../../domain/gcal/GcalCategory";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { EventDetailPopover } from "./EventDetailPopover";
import {
  dayKey,
  eventEndMs,
  eventStartMs,
  formatClock24,
  isAllDay,
  timeLabel,
} from "./gcalEventView";

const HOUR_HEIGHT = 56;
const SLOT_HEIGHT = HOUR_HEIGHT / 2;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const palette = {
  event: { background: "#e0efff", border: "#c8e1fc", ink: "#173456", accent: "#4b91d7" },
  meeting: { background: "#efe3ff", border: "#dfccf8", ink: "#392455", accent: "#9166c4" },
  task: { background: "#ddf6e9", border: "#c7ead9", ink: "#1d4c39", accent: "#53a978" },
} as const;
const pastPalette = { background: "#eeeeef", border: "#d4d4d8", ink: "#52525b", accent: "#71717a" };
const categoryIcons = { event: CalendarDays, meeting: Video, task: ListTodo } as const;

const weekContainsKey = (weekStart: Date, key: string): boolean => {
  const date = new Date(weekStart);
  for (let day = 0; day < 7; day++) {
    if (dayKey(date) === key) return true;
    date.setDate(date.getDate() + 1);
  }
  return false;
};

interface MonthGridProps {
  weeks: Date[];
  monthCursor: Date;
  events: GcalAgendaEvent[];
  notesByDay: Map<string, Note[]>;
  weekdays: string[];
  onEdit: (event: GcalAgendaEvent) => void;
  onDuplicate: (event: GcalAgendaEvent) => void;
  onDelete: (event: GcalAgendaEvent) => void;
  onReschedule: (event: GcalAgendaEvent, deltaDays: number) => void;
  onCreate: (date: Date) => void;
  onOpenNote: (noteId: string) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  weeks,
  monthCursor,
  events,
  notesByDay,
  weekdays,
  onEdit,
  onDuplicate,
  onDelete,
  onReschedule,
  onCreate,
  onOpenNote,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => new Date());
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [activeDayKey, setActiveDayKey] = useState(() => dayKey(monthCursor));
  const todayKey = dayKey(now);
  const includesToday = weeks.some((weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return weekStart <= todayStart && todayStart < weekEnd;
  });
  const nowTop = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
  const gridColumns = `64px repeat(${weeks.length}, minmax(196px, 1fr))`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const initialHour = includesToday ? Math.max(0, new Date().getHours() - 2) : 7;
      scrollRef.current.scrollTop = initialHour * HOUR_HEIGHT;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [includesToday]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setActiveDayKey(dayKey(monthCursor));
  }, [monthCursor]);

  const handleDrop = (event: React.DragEvent, date: Date) => {
    event.preventDefault();
    setDropTargetKey(null);
    const payload = event.dataTransfer.getData("text/gcal-event");
    if (!payload) return;
    const id = payload.split("|")[0];
    const dragged = events.find((entry) => entry.id === id);
    if (!dragged) return;
    const startDay = new Date(eventStartMs(dragged));
    startDay.setHours(0, 0, 0, 0);
    const dropDay = new Date(date);
    dropDay.setHours(0, 0, 0, 0);
    const delta = Math.round((dropDay.getTime() - startDay.getTime()) / 86_400_000);
    if (delta !== 0) onReschedule(dragged, delta);
  };

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto border-t bg-background">
      <div
        className="sticky top-0 z-40 grid w-max min-w-full bg-background"
        style={{ gridTemplateColumns: gridColumns }}
      >
        <div className="flex min-h-14 items-center justify-center border-b border-r px-1 text-center font-mono text-[10px] text-muted-foreground">
          24 hour
        </div>
        {weeks.map((weekStart, weekIndex) => (
          <div key={weekStart.toISOString()} className="min-w-[196px] border-r last:border-r-0">
            <div className="border-b bg-muted/40 py-1 text-center">
              <span
                className={cn(
                  "inline-flex rounded px-2 py-0.5 text-[10px] font-semibold",
                  weekContainsKey(weekStart, activeDayKey)
                    ? "bg-slate-900 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                Week {weekIndex + 1}
              </span>
            </div>
            <div className="grid grid-cols-7">
              {weekdays.map((weekday, dayIndex) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + dayIndex);
                const key = dayKey(date);
                const today = key === todayKey;
                const selected = key === activeDayKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActiveDayKey(key);
                      onCreate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9));
                    }}
                    aria-label={`Add schedule ${date.toDateString()}`}
                    className={cn(
                      "flex min-w-0 flex-col items-center border-r px-0.5 py-1 last:border-r-0 hover:bg-accent/50",
                      date.getMonth() !== monthCursor.getMonth() && "opacity-40",
                      selected && "bg-blue-50/70",
                      today && !selected && "bg-blue-50/40",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[9px] uppercase leading-3 text-muted-foreground",
                        selected && "text-blue-700/70",
                      )}
                    >
                      {weekday}
                    </span>
                    <span
                      className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded px-1 font-mono text-[11px] leading-4",
                        selected && "bg-blue-600 font-bold text-white shadow-sm",
                        !selected &&
                          today &&
                          "bg-blue-100 font-bold text-blue-800 ring-1 ring-blue-400/70",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex min-h-7 items-center justify-end border-b border-r px-2 font-mono text-[9px] text-muted-foreground">
          Notes
        </div>
        {weeks.map((weekStart) => (
          <div
            key={`notes:${weekStart.toISOString()}`}
            className="grid min-h-7 grid-cols-7 border-b border-r last:border-r-0"
          >
            {weekdays.map((_, dayIndex) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + dayIndex);
              const notes = notesByDay.get(dayKey(date)) ?? [];
              return (
                <div
                  key={dayKey(date)}
                  className="flex min-w-0 items-center justify-center border-r px-0.5 last:border-r-0"
                >
                  {notes.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setActiveDayKey(dayKey(date))}
                          aria-label={`${notes.length} notes on ${date.toDateString()}`}
                          title={MESSAGES.CAL_NOTES_ON_DAY.replace("{n}", String(notes.length))}
                          className="flex h-4 min-w-0 items-center justify-center gap-0.5 rounded-md border border-border/70 bg-card px-0.5 text-muted-foreground shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <NotebookPen className="h-2.5 w-2.5" aria-hidden="true" />
                          <span className="font-mono text-[9px] font-semibold">{notes.length}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="center"
                        className="w-64 max-w-[calc(100vw-1.5rem)] p-2"
                      >
                        <div className="mb-1 border-b px-2 pb-2">
                          <p className="text-xs font-semibold text-foreground">Notes</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Intl.DateTimeFormat("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            }).format(date)}
                          </p>
                        </div>
                        <div className="max-h-52 space-y-0.5 overflow-y-auto">
                          {notes.map((note) => (
                            <PopoverClose key={note.id} asChild>
                              <button
                                type="button"
                                onClick={() => onOpenNote(note.id)}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                <NotebookPen
                                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1 truncate">
                                  {note.title || MESSAGES.UNTITLED_NOTE}
                                </span>
                              </button>
                            </PopoverClose>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex min-h-8 items-center justify-end border-b border-r px-2 font-mono text-[9px] text-muted-foreground">
          All day
        </div>
        {weeks.map((weekStart) => (
          <div
            key={`all-day:${weekStart.toISOString()}`}
            className="grid min-h-8 grid-cols-7 border-b border-r last:border-r-0"
          >
            {weekdays.map((_, dayIndex) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + dayIndex);
              const key = dayKey(date);
              const dayStart = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              ).getTime();
              const dayEnd = dayStart + 86_400_000;
              const allDayEvents = events.filter(
                (event) =>
                  isAllDay(event) && eventStartMs(event) < dayEnd && eventEndMs(event) > dayStart,
              );
              const firstEvent = allDayEvents[0];
              const color = firstEvent
                ? eventEndMs(firstEvent) < now.getTime() ||
                  firstEvent.extendedProperties?.private?.coveTaskCompleted === "1"
                  ? pastPalette
                  : palette[getGcalCategory(firstEvent)]
                : undefined;
              const Icon = firstEvent ? categoryIcons[getGcalCategory(firstEvent)] : undefined;
              return (
                <div
                  key={key}
                  className="relative flex min-w-0 items-center justify-center border-r p-0.5 last:border-r-0"
                >
                  <button
                    type="button"
                    className="absolute inset-0"
                    aria-label={`Add all-day schedule ${date.toDateString()}`}
                    onClick={() => {
                      setActiveDayKey(key);
                      onCreate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9));
                    }}
                  />
                  {firstEvent && color && Icon && (
                    <EventDetailPopover
                      event={firstEvent}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onDelete={onDelete}
                    >
                      <button
                        type="button"
                        title={firstEvent.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                        aria-label={`All day: ${firstEvent.summary || MESSAGES.GCAL_EVENT_UNTITLED}`}
                        className="relative z-10 flex h-5 w-5 items-center justify-center rounded border shadow-sm"
                        style={{
                          backgroundColor: color.background,
                          borderColor: color.border,
                          color: color.ink,
                          filter:
                            eventEndMs(firstEvent) < now.getTime() ||
                            firstEvent.extendedProperties?.private?.coveTaskCompleted === "1"
                              ? "grayscale(1)"
                              : undefined,
                        }}
                      >
                        <Icon size={11} />
                      </button>
                    </EventDetailPopover>
                  )}
                  {allDayEvents.length > 1 && (
                    <span className="pointer-events-none absolute right-0 top-0 z-10 rounded bg-background/90 px-0.5 text-[8px] text-muted-foreground">
                      +{allDayEvents.length - 1}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="relative grid w-max min-w-full" style={{ gridTemplateColumns: gridColumns }}>
        {includesToday && (
          <div className="pointer-events-none absolute inset-x-0 z-30" style={{ top: nowTop }}>
            <span className="absolute -top-3 left-1 flex h-6 w-14 items-center justify-center rounded-md border border-blue-400 bg-blue-50 font-mono text-[11px] font-bold text-blue-700 shadow-sm">
              {formatClock24(now)}
            </span>
            <span className="absolute left-16 right-0 top-0 h-px bg-blue-500" />
            <span className="absolute left-[60px] top-[-3px] h-2 w-2 rounded-full border border-white bg-blue-600" />
          </div>
        )}
        <div className="relative border-r" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {HOURS.map((hour) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 font-mono text-[9px] text-muted-foreground"
              style={{ top: hour * HOUR_HEIGHT }}
            >
              {formatClock24(new Date(2020, 0, 1, hour))}
            </span>
          ))}
        </div>
        {weeks.map((weekStart) => (
          <div
            key={`week-grid:${weekStart.toISOString()}`}
            className="grid min-w-[196px] grid-cols-7 border-r last:border-r-0"
          >
            {weekdays.map((_, dayIndex) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + dayIndex);
              const key = dayKey(date);
              const dayStart = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              ).getTime();
              const dayEnd = dayStart + 86_400_000;
              const isToday = key === todayKey;
              const inMonth = date.getMonth() === monthCursor.getMonth();
              const timedEvents = events.filter(
                (event) =>
                  !isAllDay(event) && eventStartMs(event) < dayEnd && eventEndMs(event) > dayStart,
              );
              const slotEvents = new Map<number, GcalAgendaEvent[]>();
              for (const event of timedEvents) {
                const start = new Date(Math.max(eventStartMs(event), dayStart));
                const slot = Math.min(
                  47,
                  Math.floor((start.getHours() * 60 + start.getMinutes()) / 30),
                );
                const list = slotEvents.get(slot) ?? [];
                list.push(event);
                slotEvents.set(slot, list);
              }
              return (
                <div
                  key={key}
                  className={cn(
                    "relative border-r last:border-r-0",
                    !inMonth && "bg-muted/20",
                    isToday && "bg-blue-50/30",
                    dropTargetKey === key && "bg-blue-100/70",
                  )}
                  style={{ height: HOURS.length * HOUR_HEIGHT }}
                >
                  {Array.from({ length: 48 }, (_, slot) => {
                    const hour = Math.floor(slot / 2);
                    const minute = (slot % 2) * 30;
                    return (
                      <button
                        key={`${hour}:${minute}`}
                        type="button"
                        aria-label={`Add schedule ${date.toDateString()} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`}
                        onClick={() => {
                          setActiveDayKey(key);
                          onCreate(
                            new Date(
                              date.getFullYear(),
                              date.getMonth(),
                              date.getDate(),
                              hour,
                              minute,
                            ),
                          );
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDropTargetKey(key);
                        }}
                        onDragLeave={() =>
                          setDropTargetKey((previous) => (previous === key ? null : previous))
                        }
                        onDrop={(event) => handleDrop(event, date)}
                        className={cn(
                          "absolute inset-x-0 z-0 w-full hover:bg-primary/5 focus-visible:bg-primary/10 focus-visible:outline-none",
                          slot % 2 === 0 && "border-t border-border/50",
                        )}
                        style={{ top: slot * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                      />
                    );
                  })}
                  {[...slotEvents.entries()].map(([slot, slotList]) => (
                    <div
                      key={`slot-events:${slot}`}
                      className="pointer-events-none absolute inset-x-0 z-10 flex h-4 items-center gap-0.5 overflow-hidden px-0.5"
                      style={{ top: slot * SLOT_HEIGHT + (SLOT_HEIGHT - 16) / 2 }}
                    >
                      {slotList.slice(0, 2).map((event) => {
                        const category = getGcalCategory(event);
                        const completedTask =
                          category === "task" &&
                          event.extendedProperties?.private?.coveTaskCompleted === "1";
                        const pastEvent = eventEndMs(event) < now.getTime() || completedTask;
                        const color = pastEvent ? pastPalette : palette[category];
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
                              draggable={!event.id.includes("_")}
                              onDragStart={(dragEvent) => {
                                dragEvent.dataTransfer.setData(
                                  "text/gcal-event",
                                  `${event.id}|${event.calendarId}`,
                                );
                                dragEvent.dataTransfer.effectAllowed = "move";
                              }}
                              title={`${timeLabel(event)} ${event.summary ?? ""}`.trim()}
                              aria-label={`${timeLabel(event)}: ${event.summary || MESSAGES.GCAL_EVENT_UNTITLED}`}
                              className="pointer-events-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border shadow-sm hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              style={{
                                backgroundColor: color.background,
                                borderColor: color.border,
                                color: color.ink,
                                filter: pastEvent ? "grayscale(1)" : undefined,
                              }}
                            >
                              <Icon size={10} strokeWidth={2.5} />
                            </button>
                          </EventDetailPopover>
                        );
                      })}
                      {slotList.length > 2 && (
                        <span className="rounded-sm bg-background/90 px-0.5 text-[8px] text-muted-foreground">
                          +{slotList.length - 2}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {events.length === 0 && notesByDay.size === 0 && (
        <p className="py-8 text-center text-[13px] text-muted-foreground">
          {MESSAGES.CAL_EMPTY_MONTH}
        </p>
      )}
    </div>
  );
};
