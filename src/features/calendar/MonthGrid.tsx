import { NotebookPen } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { EventDetailPopover } from "./EventDetailPopover";
import { dayKey, eventStartMs, timeLabel, type WeekBar, weekBars } from "./gcalEventView";

const DAY_HEADER_H = 22;
const LANE_H = 24;
const MAX_LANES = 3;

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
}

/** Greedy interval-lane packing: overlapping bars get separate vertical lanes. */
const layoutLanes = (bars: WeekBar[]): Array<{ bar: WeekBar; lane: number }> => {
  const laneEnds: number[] = [];
  return bars.map((bar) => {
    let lane = laneEnds.findIndex((end) => end < bar.colStart);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = bar.colStart + bar.span - 1;
    return { bar, lane };
  });
};

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
}) => {
  const todayKey = dayKey(new Date());
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);

  const handleDrop = (event: React.DragEvent, date: Date) => {
    event.preventDefault();
    setDropTargetKey(null);
    setDraggingKey(null);
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
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
      <div className="grid grid-cols-7 pt-3 pb-1">
        {weekdays.map((weekday) => (
          <span
            key={weekday}
            className="text-center font-mono text-[10px] font-semibold uppercase leading-4 tracking-widest text-muted-foreground"
          >
            {weekday}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {weeks.map((weekStart) => {
          const bars = weekBars(events, weekStart);
          const placed = layoutLanes(bars);
          const visible = placed.filter((entry) => entry.lane < MAX_LANES);
          const hidden = placed.length - visible.length;
          const laneCount = Math.min(
            Math.max(
              visible.reduce((max, entry) => Math.max(max, entry.lane + 1), 1),
              1,
            ),
            MAX_LANES,
          );
          const rowH = DAY_HEADER_H + laneCount * LANE_H + 6 + (hidden > 0 ? 16 : 0);

          return (
            <div
              key={weekStart.toISOString()}
              className="relative grid grid-cols-7 gap-px rounded-lg bg-border/40"
              style={{ height: rowH }}
            >
              {Array.from({ length: 7 }, (_, col) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + col);
                const key = dayKey(date);
                const notCurrentMonth = date.getMonth() !== monthCursor.getMonth();
                const isToday = key === todayKey;
                const dayNotes = notesByDay.get(key) ?? [];
                return (
                  <div
                    key={key}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDropTargetKey(key);
                    }}
                    onDragLeave={() => setDropTargetKey((prev) => (prev === key ? null : prev))}
                    onDrop={(event) => handleDrop(event, date)}
                    className={cn(
                      "relative flex flex-col rounded-md bg-card/40 p-1 transition-colors",
                      notCurrentMonth && "opacity-40",
                      isToday && "bg-primary/5 ring-1 ring-primary/40 ring-inset",
                      dropTargetKey === key && "bg-primary/10 ring-1 ring-primary/60 ring-inset",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "px-0.5 font-mono text-[11px] leading-4",
                          isToday ? "font-semibold text-primary" : "text-muted-foreground",
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {dayNotes.length > 0 && (
                        <span
                          title={MESSAGES.CAL_NOTES_ON_DAY.replace("{n}", String(dayNotes.length))}
                          className="flex items-center gap-0.5 pr-0.5 font-mono text-[9px] leading-4 text-muted-foreground/70"
                        >
                          <NotebookPen className="h-2.5 w-2.5" aria-hidden="true" />
                          {dayNotes.length}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div aria-hidden="false" className="pointer-events-none absolute inset-0">
                {visible.map(({ bar, lane }) => {
                  const barKey = `${bar.event.calendarId}:${bar.event.id}`;
                  return (
                    <div
                      key={barKey}
                      className="pointer-events-auto absolute px-0.5"
                      style={{
                        left: `${((bar.colStart - 1) / 7) * 100}%`,
                        width: `${(bar.span / 7) * 100}%`,
                        top: DAY_HEADER_H + lane * LANE_H,
                        height: 20,
                      }}
                    >
                      <EventDetailPopover
                        event={bar.event}
                        onEdit={onEdit}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                      >
                        <button
                          type="button"
                          draggable={!bar.event.id.includes("_")}
                          onDragStart={(event) => {
                            event.dataTransfer.setData(
                              "text/gcal-event",
                              `${bar.event.id}|${bar.event.calendarId}`,
                            );
                            event.dataTransfer.effectAllowed = "move";
                            setDraggingKey(barKey);
                          }}
                          onDragEnd={() => setDraggingKey(null)}
                          style={{
                            backgroundColor: bar.event.calendarColor ?? "var(--muted-foreground)",
                          }}
                          className={cn(
                            "flex h-5 w-full min-w-0 items-center gap-1 rounded-sm px-1.5 text-[11px] leading-4 text-white select-none",
                            "cursor-grab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
                            !bar.startsHere && "rounded-l-none",
                            !bar.endsHere && "rounded-r-none",
                            draggingKey === barKey && "opacity-50",
                          )}
                          title={`${timeLabel(bar.event)} ${bar.event.summary ?? ""}`.trim()}
                        >
                          {bar.startsHere && bar.event.start.dateTime && (
                            <span className="shrink-0 font-mono text-[10px] opacity-80">
                              {timeLabel(bar.event).replace(/\s?(AM|PM)/i, "")}
                            </span>
                          )}
                          <span className="truncate">
                            {bar.event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                          </span>
                        </button>
                      </EventDetailPopover>
                    </div>
                  );
                })}
                {hidden > 0 && (
                  <span
                    className="absolute px-1.5 text-[10px] leading-4 text-muted-foreground"
                    style={{
                      left: 0,
                      top: DAY_HEADER_H + laneCount * LANE_H,
                    }}
                  >
                    {MESSAGES.CAL_MORE.replace("{n}", String(hidden))}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && notesByDay.size === 0 && (
        <p className="pt-10 text-center text-[13px] text-muted-foreground">
          {MESSAGES.CAL_EMPTY_MONTH}
        </p>
      )}
    </div>
  );
};
