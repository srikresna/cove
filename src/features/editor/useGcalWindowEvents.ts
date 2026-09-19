import { useEffect, useMemo, useState } from "react";
import { gcalService } from "../../di/container";
import type { GcalEvent } from "../../domain/gcal/GcalTypes";
import { GcalReauthError } from "../../services/gcal/GcalService";
import { useGcalStore } from "../../store/useGcalStore";
import { useSettingsStore } from "../../store/useSettingsStore";

export function useGcalWindowEvents(
  from: Date,
  to: Date,
): {
  events: GcalEvent[];
  calendarId: string;
} {
  const status = useGcalStore((s) => s.status);
  const calendars = useGcalStore((s) => s.calendars);
  const refreshTick = useGcalStore((s) => s.refreshTick);
  const showEvents = useSettingsStore((s) => s.gcalShowEvents);
  const [events, setEvents] = useState<GcalEvent[]>([]);

  const calendarId = useMemo(
    () => calendars.find((calendar) => calendar.primary)?.id ?? "primary",
    [calendars],
  );

  const fromMs = from.getTime();
  const toMs = to.getTime();
  const active = showEvents && status === "connected";

  useEffect(() => {
    void gcalService.ensureLoaded().catch(() => {});
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTick is an intentional reload signal after local create/delete, not a body input
  useEffect(() => {
    if (!active) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const cached = await gcalService.loadCachedWindow(fromMs, toMs);
          if (cancelled) return;
          setEvents(cached.map((entry) => entry.event));
        } catch {
          // Locked vault or suspended DB — no cached paint this round.
        }
        try {
          const fresh = await gcalService.syncWindow(calendarId, fromMs, toMs);
          if (!cancelled) setEvents(fresh);
        } catch (err) {
          if (err instanceof GcalReauthError) return;
          // Offline or transient API failure — the cached view stays.
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [active, calendarId, fromMs, toMs, refreshTick]);

  return { events, calendarId };
}
