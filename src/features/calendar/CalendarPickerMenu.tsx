import { Layers } from "lucide-react";
import type React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MESSAGES } from "../../constants/messages";
import { gcalService } from "../../di/container";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";

export const CalendarPickerMenu: React.FC<{ className?: string }> = ({ className }) => {
  const calendars = useGcalStore((s) => s.calendars);
  const selectedIds = useGcalStore((s) => s.selectedCalendarIds);

  const toggle = (calendarId: string) => {
    const next = selectedIds.includes(calendarId)
      ? selectedIds.filter((id) => id !== calendarId)
      : [...selectedIds, calendarId];
    void gcalService.updateSelectedCalendars(next).catch((err) => notifyError(err));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={MESSAGES.GCAL_CALENDARS_PICKER}
          title={MESSAGES.GCAL_CALENDARS_PICKER}
          className={
            className ??
            "rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          }
        >
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {calendars.length === 0 ? (
          <DropdownMenuItem disabled>{MESSAGES.GCAL_RECONNECT_FOR_CALENDARS}</DropdownMenuItem>
        ) : (
          calendars.map((calendar) => (
            <DropdownMenuCheckboxItem
              key={calendar.id}
              checked={selectedIds.includes(calendar.id)}
              onCheckedChange={() => toggle(calendar.id)}
              onSelect={(e) => e.preventDefault()}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: calendar.backgroundColor ?? "transparent" }}
              />
              <span className="truncate">
                {calendar.summary || calendar.id}
                {calendar.primary ? ` (${MESSAGES.GCAL_PRIMARY_SUFFIX})` : ""}
              </span>
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
