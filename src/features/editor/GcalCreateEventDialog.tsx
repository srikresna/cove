import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { MESSAGES } from "../../constants/messages";
import {
  type GcalCategory,
  getGcalCategory,
  withGcalCategory,
} from "../../domain/gcal/GcalCategory";
import type { GcalCalendar, GcalEvent, GcalEventInput } from "../../domain/gcal/GcalTypes";
import { cn } from "../../lib/utils";

const toDateString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const combine = (date: string, time: string): Date => new Date(`${date}T${time}:00`);

const timeString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const newEventId = (): string => crypto.randomUUID().replaceAll("-", "");

const inputClasses =
  "flex h-8 w-full rounded-md border border-border bg-background px-2.5 text-[13px] leading-5 text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring";

export const GcalCreateEventDialog: React.FC<{
  open: boolean;
  defaultDate: Date;
  editing?: GcalEvent | null;
  calendars?: GcalCalendar[];
  defaultCalendarId?: string;
  defaultCategory?: GcalCategory;
  onConfirm: (input: GcalEventInput, calendarId: string) => void;
  onCancel: () => void;
}> = ({
  open,
  defaultDate,
  editing = null,
  calendars = [],
  defaultCalendarId,
  defaultCategory = "event",
  onConfirm,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toDateString(defaultDate));
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [calendarId, setCalendarId] = useState(defaultCalendarId ?? "primary");
  const [category, setCategory] = useState<GcalCategory>(defaultCategory);

  useEffect(() => {
    if (open) {
      if (editing) {
        setCategory(getGcalCategory(editing));
        setCalendarId(defaultCalendarId ?? "primary");
        setTitle(editing.summary ?? "");
        setLocation(editing.location ?? "");
        setDescription(editing.description ?? "");
        if (editing.start.date) {
          setDate(editing.start.date);
          setAllDay(true);
        } else {
          const startDate = new Date(editing.start.dateTime ?? Date.now());
          const endDate = new Date(editing.end.dateTime ?? startDate.getTime() + 3_600_000);
          setDate(toDateString(startDate));
          setAllDay(false);
          setStart(timeString(startDate));
          setEnd(timeString(endDate > startDate ? endDate : startDate));
        }
      } else {
        setCategory(defaultCategory);
        setTitle("");
        setLocation("");
        setDescription("");
        setDate(toDateString(defaultDate));
        setAllDay(false);
        setStart(timeString(defaultDate));
        setEnd(timeString(new Date(defaultDate.getTime() + 3_600_000)));
        setCalendarId(defaultCalendarId ?? "primary");
      }
    }
  }, [open, editing, defaultDate, defaultCalendarId, defaultCategory]);

  const trimmed = title.trim();
  const valid =
    trimmed && date && (!allDay ? start && end && combine(date, end) > combine(date, start) : true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    const common = {
      id: editing?.id ?? newEventId(),
      summary: trimmed,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      extendedProperties: editing?.extendedProperties,
    };
    if (allDay) {
      const midnight = combine(date, "00:00");
      const endDate = new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() + 1);
      onConfirm(
        withGcalCategory(
          { ...common, start: { date }, end: { date: toDateString(endDate) } },
          category,
        ),
        calendarId,
      );
      return;
    }
    onConfirm(
      withGcalCategory(
        {
          ...common,
          start: { dateTime: combine(date, start).toISOString() },
          end: { dateTime: combine(date, end).toISOString() },
        },
        category,
      ),
      calendarId,
    );
  };

  const fieldClass = "font-mono text-[13px]";
  const selectedCalendar = calendars.find((entry) => entry.id === calendarId);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-sm" hideClose>
        <DialogHeader>
          <DialogTitle>
            {editing ? MESSAGES.GCAL_EDIT_EVENT_TITLE : MESSAGES.GCAL_ADD_EVENT_TITLE}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update this schedule in Google Calendar."
              : "This schedule will be saved as an event in Google Calendar."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset className="flex gap-1 rounded-lg bg-muted/60 p-1" aria-label="Schedule type">
            {(
              [
                ["event", "Event"],
                ["meeting", "Meeting"],
                ["task", "Task reminder"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={category === value}
                onClick={() => setCategory(value)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-xs",
                  category === value
                    ? "bg-card font-semibold text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </fieldset>
          <div className="space-y-1.5">
            <Label htmlFor="gcal-event-title">{MESSAGES.GCAL_EVENT_NAME_LABEL}</Label>
            <Input
              id="gcal-event-title"
              autoFocus
              value={title}
              placeholder={MESSAGES.GCAL_EVENT_NAME_PLACEHOLDER}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gcal-event-date">{MESSAGES.GCAL_EVENT_DATE_LABEL}</Label>
              <Input
                id="gcal-event-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            {!editing && calendars.length > 0 && (
              <div className="space-y-1.5">
                <Label>{MESSAGES.GCAL_CALENDAR_LABEL}</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(inputClasses, "items-center justify-between text-left")}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full border border-border"
                          style={{
                            backgroundColor: selectedCalendar?.backgroundColor ?? "transparent",
                          }}
                        />
                        <span className="truncate">
                          {selectedCalendar?.summary || MESSAGES.GCAL_PRIMARY_SUFFIX}
                        </span>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {calendars.map((calendar) => (
                      <DropdownMenuItem
                        key={calendar.id}
                        onSelect={() => setCalendarId(calendar.id)}
                      >
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: calendar.backgroundColor ?? "transparent" }}
                        />
                        <span className="truncate">{calendar.summary || calendar.id}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
            <Label htmlFor="gcal-event-all-day">{MESSAGES.GCAL_EVENT_ALL_DAY}</Label>
            <Switch
              id="gcal-event-all-day"
              checked={allDay}
              onCheckedChange={setAllDay}
              aria-label={MESSAGES.GCAL_EVENT_ALL_DAY}
            />
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gcal-event-start">{MESSAGES.GCAL_EVENT_START_LABEL}</Label>
                <Input
                  id="gcal-event-start"
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="gcal-event-end"
                  className={cn(!valid && trimmed && "text-destructive")}
                >
                  {MESSAGES.GCAL_EVENT_END_LABEL}
                </Label>
                <Input
                  id="gcal-event-end"
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  aria-invalid={!valid && Boolean(trimmed)}
                  className={cn(fieldClass, !valid && trimmed && "border-destructive")}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="gcal-event-location">{MESSAGES.GCAL_LOCATION_LABEL}</Label>
            <Input
              id="gcal-event-location"
              value={location}
              placeholder={MESSAGES.GCAL_LOCATION_PLACEHOLDER}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gcal-event-description">{MESSAGES.GCAL_DESCRIPTION_LABEL}</Label>
            <textarea
              id="gcal-event-description"
              value={description}
              placeholder={MESSAGES.GCAL_DESCRIPTION_PLACEHOLDER}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={cn(inputClasses, "h-auto resize-none py-1.5")}
            />
          </div>

          {!valid && trimmed && !allDay && (
            <p className="text-[12px] text-destructive">{MESSAGES.GCAL_TIME_INVALID}</p>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={onCancel}>
              {MESSAGES.CANCEL}
            </Button>
            <Button type="submit" disabled={!valid}>
              {editing ? MESSAGES.GCAL_SAVE_EVENT : MESSAGES.GCAL_ADD_EVENT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
