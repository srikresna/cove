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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { MESSAGES } from "../../constants/messages";
import type { GcalEventInput } from "../../domain/gcal/GcalTypes";
import { cn } from "../../lib/utils";

const toDateString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const combine = (date: string, time: string): Date => new Date(`${date}T${time}:00`);

const newEventId = (): string => crypto.randomUUID().replaceAll("-", "");

export const GcalCreateEventDialog: React.FC<{
  open: boolean;
  defaultDate: Date;
  onConfirm: (input: GcalEventInput) => void;
  onCancel: () => void;
}> = ({ open, defaultDate, onConfirm, onCancel }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toDateString(defaultDate));
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDate(toDateString(defaultDate));
      setAllDay(false);
      setStart("09:00");
      setEnd("10:00");
    }
  }, [open, defaultDate]);

  const trimmed = title.trim();
  const valid =
    trimmed && date && (!allDay ? start && end && combine(date, end) > combine(date, start) : true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    if (allDay) {
      const midnight = combine(date, "00:00");
      const endDate = new Date(midnight.getFullYear(), midnight.getMonth(), midnight.getDate() + 1);
      onConfirm({
        id: newEventId(),
        summary: trimmed,
        start: { date },
        end: { date: toDateString(endDate) },
        extendedProperties: { private: { cove: "1" } },
      });
      return;
    }
    onConfirm({
      id: newEventId(),
      summary: trimmed,
      start: { dateTime: combine(date, start).toISOString() },
      end: { dateTime: combine(date, end).toISOString() },
      extendedProperties: { private: { cove: "1" } },
    });
  };

  const fieldClass = "font-mono text-[13px]";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-sm" hideClose>
        <DialogHeader>
          <DialogTitle>{MESSAGES.GCAL_ADD_EVENT_TITLE}</DialogTitle>
          <DialogDescription>{MESSAGES.GCAL_ADD_EVENT_DESC}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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

          {!valid && trimmed && !allDay && (
            <p className="text-[12px] text-destructive">{MESSAGES.GCAL_TIME_INVALID}</p>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={onCancel}>
              {MESSAGES.CANCEL}
            </Button>
            <Button type="submit" disabled={!valid}>
              {MESSAGES.GCAL_ADD_EVENT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
