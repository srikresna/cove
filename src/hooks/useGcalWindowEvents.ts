import { useEffect } from "react";
import { gcalService } from "../di/container";
import type { GcalAgendaEvent } from "../domain/gcal/GcalTypes";
import { GcalReauthError } from "../services/gcal/GcalService";
import { useGcalStore } from "../store/useGcalStore";
import { useSettingsStore } from "../store/useSettingsStore";

export function useGcalWindowEvents(
  from: Date,
  to: Date,
): {
  events: GcalAgendaEvent[];
  createCalendarId: string;
} {
  const status = useGcalStore((s) => s.status);
  const calendars = useGcalStore((s) => s.calendars);
  const selectedCalendarIds = useGcalStore((s) => s.selectedCalendarIds);
  const refreshTick = useGcalStore((s) => s.refreshTick);
  const events = useGcalStore((s) => s.events);
  const showEvents = useSettingsStore((s) => s.gcalShowEvents);
  const showReminders = useSettingsStore((s) => s.gcalReminders);

  const createCalendarId =
    calendars.find((calendar) => calendar.primary)?.id ?? selectedCalendarIds[0] ?? "primary";

  const fromMs = from.getTime();
  const toMs = to.getTime();
  const active = showEvents && status === "connected";

  useEffect(() => {
    void gcalService.ensureLoaded().catch(() => {});
  }, []);

  useEffect(() => {
    if (!active) {
      useGcalStore.getState().setEvents([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const cached = await gcalService.loadCachedWindow(fromMs, toMs);
          if (cancelled) return;
          useGcalStore.getState().setEvents(cached);
        } catch {
          // Locked vault or suspended DB — no cached paint this round.
        }
        try {
          const fresh = await gcalService.syncAllSelected(fromMs, toMs);
          if (!cancelled) {
            useGcalStore.getState().setEvents(fresh);
            if (showReminders) gcalService.syncReminders(fresh);
          }
        } catch (err) {
          if (err instanceof GcalReauthError) return;
          // Offline or transient API failure — the cached view stays, flagged stale.
          if (!cancelled) useGcalStore.getState().setSyncFailed(true);
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTick is an intentional reload signal after local edits, not a body input
  }, [active, selectedCalendarIds, fromMs, toMs, refreshTick, showReminders]);

  return { events, createCalendarId };
}
