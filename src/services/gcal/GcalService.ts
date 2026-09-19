import { invoke } from "@tauri-apps/api/core";
import {
  cancelAll,
  isPermissionGranted,
  requestPermission,
  Schedule,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { getGcalClientId, getGcalClientSecret, getGcalRemindersEnabled } from "../../config/gcal";
import type { EncryptedPayload } from "../../domain/EncryptedPayload";
import type {
  GcalAccessToken,
  GcalAgendaEvent,
  GcalCalendar,
  GcalEvent,
  GcalEventInput,
  GcalEventPatch,
  GcalTokens,
} from "../../domain/gcal/GcalTypes";
import { GCAL_SCOPE } from "../../domain/gcal/GcalTypes";
import { EncryptionError } from "../../errors/AppError";
import type { IGcalRepository } from "../../repositories/IGcalRepository";
import { useGcalStore } from "../../store/useGcalStore";
import { gcalEventAad, gcalTokenAad } from "../vault/aad";
import type { CryptoVault } from "../vault/CryptoVault";

export class GcalReauthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GcalReauthError";
  }
}

interface TokenBlob {
  refreshToken: string;
  scope: string;
  email: string | null;
  clientId: string;
  clientSecret: string;
  calendars: GcalCalendar[];
  selectedCalendarIds: string[];
}

const AUTOSYNC_INTERVAL_MS = 10 * 60 * 1000;
const REMINDER_LEAD_MS = 10 * 60 * 1000;
const REMINDER_HORIZON_MS = 24 * 60 * 60 * 1000;

export const gcalStartMs = (event: GcalEvent): number =>
  event.start.dateTime
    ? Date.parse(event.start.dateTime)
    : event.start.date
      ? new Date(`${event.start.date}T00:00:00`).getTime()
      : 0;

export const gcalEndMs = (event: GcalEvent): number =>
  event.end.dateTime
    ? Date.parse(event.end.dateTime)
    : event.end.date
      ? new Date(`${event.end.date}T00:00:00`).getTime()
      : 0;

export class GcalService {
  private tokenBlob: TokenBlob | null = null;
  private access: GcalAccessToken | null = null;
  private inflightRefresh: Promise<GcalAccessToken> | null = null;
  private restoreAttempted = false;
  private autoSyncTimer: number | null = null;
  private lastWindow: { calendarIds: string[]; fromMs: number; toMs: number } | null = null;
  private reminderKeys = new Set<string>();

  constructor(
    private readonly deps: {
      repo: IGcalRepository;
      crypto: CryptoVault;
    },
  ) {}

  clientId(): string {
    return getGcalClientId();
  }

  isConnected(): boolean {
    return this.tokenBlob !== null;
  }

  selectedCalendarIds(): string[] {
    if (!this.tokenBlob) return ["primary"];
    if (this.tokenBlob.selectedCalendarIds.length === 0) {
      const primary = this.tokenBlob.calendars.find((calendar) => calendar.primary);
      return [primary?.id ?? "primary"];
    }
    return this.tokenBlob.selectedCalendarIds;
  }

  async restore(): Promise<void> {
    const store = useGcalStore.getState();
    try {
      const payload = await this.deps.repo.getTokenPayload();
      if (!payload) {
        this.restoreAttempted = true;
        store.setStatus("disconnected");
        return;
      }
      const raw = JSON.parse(
        new TextDecoder().decode(await this.deps.crypto.decryptBlob(payload, gcalTokenAad())),
      ) as Partial<TokenBlob>;
      this.tokenBlob = {
        refreshToken: raw.refreshToken ?? "",
        scope: raw.scope ?? "",
        email: raw.email ?? null,
        clientId: raw.clientId ?? "",
        clientSecret: raw.clientSecret ?? "",
        calendars: raw.calendars ?? [],
        selectedCalendarIds: raw.selectedCalendarIds ?? [],
      };
      this.restoreAttempted = true;
      store.setStatus("connected");
      store.setAccountEmail(this.tokenBlob.email);
      store.setCalendars(this.tokenBlob.calendars);
      store.setSelectedCalendarIds(this.selectedCalendarIds());
      this.startAutoSync();
      if (this.tokenBlob.calendars.length === 0) {
        void this.listCalendars().catch(() => {
          useGcalStore.getState().setWideScopeMissing(true);
        });
      }
    } catch (err) {
      if (err instanceof EncryptionError && err.reason === "key_unavailable") {
        return;
      }
      this.restoreAttempted = true;
      this.tokenBlob = null;
      store.setStatus("reauth");
    }
  }

  async ensureLoaded(): Promise<void> {
    if (this.tokenBlob || this.restoreAttempted) return;
    await this.restore();
  }

  clear(): void {
    this.stopAutoSync();
    void cancelAll().catch(() => {});
    this.reminderKeys.clear();
    this.tokenBlob = null;
    this.access = null;
    this.lastWindow = null;
    this.restoreAttempted = false;
    useGcalStore.getState().reset();
  }

  async connect(): Promise<void> {
    const store = useGcalStore.getState();
    store.setStatus("connecting");
    try {
      const tokens = await invoke<GcalTokens>("gcal_connect", {
        clientId: this.clientId(),
        clientSecret: getGcalClientSecret(),
      });
      this.assertWritableScope(tokens.scope);
      this.access = {
        accessToken: tokens.accessToken,
        expiresAtMs: tokens.expiresAtMs,
        scope: tokens.scope,
      };

      let email: string | null = null;
      let calendars: GcalCalendar[] = [];
      try {
        calendars = await invoke<GcalCalendar[]>("gcal_list_calendars", {
          accessToken: tokens.accessToken,
        });
        const primary = calendars.find((calendar) => calendar.primary);
        email = primary?.id ?? null;
      } catch {
        // Calendar metadata needs the wider scope — email stays unknown.
      }
      const previous = this.tokenBlob;
      const blob: TokenBlob = {
        refreshToken: tokens.refreshToken,
        scope: tokens.scope,
        email,
        clientId: this.clientId(),
        clientSecret: getGcalClientSecret(),
        calendars,
        selectedCalendarIds: previous?.selectedCalendarIds ?? [],
      };
      await this.persistTokenBlob(blob);
      this.tokenBlob = blob;

      store.setStatus("connected");
      store.setAccountEmail(blob.email);
      store.setCalendars(blob.calendars);
      store.setWideScopeMissing(blob.calendars.length === 0);
      store.setSelectedCalendarIds(this.selectedCalendarIds());
      this.startAutoSync();
    } catch (err) {
      store.setStatus(this.tokenBlob || err instanceof GcalReauthError ? "reauth" : "disconnected");
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    await this.deps.repo.clearToken();
    await this.deps.repo.clearEvents();
    this.clear();
  }

  async listCalendars(): Promise<GcalCalendar[]> {
    const accessToken = await this.ensureAccessToken();
    const calendars = await invoke<GcalCalendar[]>("gcal_list_calendars", { accessToken });
    useGcalStore.getState().setCalendars(calendars);
    useGcalStore.getState().setWideScopeMissing(false);
    if (this.tokenBlob) {
      this.tokenBlob = { ...this.tokenBlob, calendars };
      await this.persistTokenBlob(this.tokenBlob);
    }
    return calendars;
  }

  async updateSelectedCalendars(ids: string[]): Promise<void> {
    if (!this.tokenBlob) return;
    const selected = this.tokenBlob.calendars
      .map((calendar) => calendar.id)
      .filter((id) => ids.includes(id));
    this.tokenBlob = {
      ...this.tokenBlob,
      selectedCalendarIds: selected.length > 0 ? selected : this.selectedCalendarIds(),
    };
    await this.persistTokenBlob(this.tokenBlob);
    useGcalStore.getState().setSelectedCalendarIds(this.selectedCalendarIds());
    useGcalStore.getState().bumpRefresh();
  }

  async syncWindow(calendarId: string, fromMs: number, toMs: number): Promise<GcalEvent[]> {
    const accessToken = await this.ensureAccessToken();
    const events = await invoke<GcalEvent[]>("gcal_list_events", {
      accessToken,
      calendarId,
      timeMin: new Date(fromMs).toISOString(),
      timeMax: new Date(toMs).toISOString(),
    });
    const live = events.filter((event) => event.status !== "cancelled");
    const rows = await Promise.all(
      live.map(async (event) => ({
        id: event.id,
        startsAt: gcalStartMs(event),
        endsAt: gcalEndMs(event),
        payload: await this.encryptEvent(event),
      })),
    );
    await this.deps.repo.replaceWindow(calendarId, fromMs, toMs, rows);
    const store = useGcalStore.getState();
    store.setLastSyncAt(Date.now());
    store.setSyncFailed(false);
    return live;
  }

  async loadCachedWindow(fromMs: number, toMs: number): Promise<GcalAgendaEvent[]> {
    const rows = await this.deps.repo.listEventsBetween(fromMs, toMs);
    const calendars = this.tokenBlob?.calendars ?? [];
    const out: GcalAgendaEvent[] = [];
    for (const row of rows) {
      try {
        const event = JSON.parse(
          new TextDecoder().decode(
            await this.deps.crypto.decryptBlob(row.payload, gcalEventAad(row.id)),
          ),
        ) as GcalEvent;
        out.push(this.decorate(event, row.calendarId, calendars));
      } catch {
        // A single undecryptable cached event is dropped, not fatal.
      }
    }
    return out;
  }

  async createEvent(calendarId: string, input: GcalEventInput): Promise<GcalEvent> {
    const accessToken = await this.ensureAccessToken();
    const created = await invoke<GcalEvent>("gcal_create_event", {
      accessToken,
      calendarId,
      event: input,
    });
    await this.deps.repo.upsertEvent({
      id: created.id,
      calendarId,
      startsAt: gcalStartMs(created),
      endsAt: gcalEndMs(created),
      payload: await this.encryptEvent(created),
    });
    useGcalStore.getState().bumpRefresh();
    return created;
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    patch: GcalEventPatch,
  ): Promise<GcalEvent> {
    const accessToken = await this.ensureAccessToken();
    const updated = await invoke<GcalEvent>("gcal_update_event", {
      accessToken,
      calendarId,
      eventId,
      patch,
    });
    await this.deps.repo.upsertEvent({
      id: updated.id,
      calendarId,
      startsAt: gcalStartMs(updated),
      endsAt: gcalEndMs(updated),
      payload: await this.encryptEvent(updated),
    });
    useGcalStore.getState().bumpRefresh();
    return updated;
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    if (eventId.includes("_")) {
      throw new Error(
        "This is one occurrence of a repeating event — delete the whole series from Google Calendar.",
      );
    }
    const accessToken = await this.ensureAccessToken();
    await invoke("gcal_delete_event", { accessToken, calendarId, eventId });
    await this.deps.repo.deleteEvent(eventId);
    useGcalStore.getState().bumpRefresh();
  }

  async syncAllSelected(fromMs: number, toMs: number): Promise<GcalAgendaEvent[]> {
    const calendarIds = this.selectedCalendarIds();
    const results = await Promise.allSettled(
      calendarIds.map((calendarId) => this.syncWindow(calendarId, fromMs, toMs)),
    );
    const calendars = this.tokenBlob?.calendars ?? [];
    const merged: GcalAgendaEvent[] = [];
    let anyFailed = false;
    for (let index = 0; index < calendarIds.length; index++) {
      const calendarId = calendarIds[index];
      if (!calendarId) continue;
      const result = results[index];
      if (result && result.status === "fulfilled") {
        for (const event of result.value) merged.push(this.decorate(event, calendarId, calendars));
      } else {
        anyFailed = true;
      }
    }
    if (anyFailed) useGcalStore.getState().setSyncFailed(true);
    this.lastWindow = { calendarIds, fromMs, toMs };
    return merged;
  }

  syncReminders(events: GcalAgendaEvent[]): void {
    if (!getGcalRemindersEnabled()) return;
    void (async () => {
      try {
        if (!(await isPermissionGranted())) {
          const permission = await requestPermission();
          if (permission !== "granted") return;
        }
        await cancelAll();
        this.reminderKeys.clear();
        const now = Date.now();
        for (const event of events) {
          const start = gcalStartMs(event);
          if (!event.start.dateTime || start <= now || start > now + REMINDER_HORIZON_MS) continue;
          const at = start - REMINDER_LEAD_MS;
          if (at <= now) continue;
          const key = `${event.calendarId}:${event.id}:${start}`;
          if (this.reminderKeys.has(key)) continue;
          this.reminderKeys.add(key);
          sendNotification({
            title: MESSAGES_TITLE,
            body: `${timeLabel(event)} — ${event.summary || MESSAGES_UNTITLED}`,
            schedule: Schedule.at(new Date(at)),
          });
        }
      } catch {
        // Notifications are best-effort; never surface as errors.
      }
    })();
  }

  private startAutoSync(): void {
    this.stopAutoSync();
    this.autoSyncTimer = window.setInterval(() => {
      const lastWindow = this.lastWindow;
      if (!this.tokenBlob || !lastWindow) return;
      void this.syncAllSelected(lastWindow.fromMs, lastWindow.toMs)
        .then((events) => {
          useGcalStore.getState().setEvents(events);
          this.syncReminders(events);
        })
        .catch(() => {
          useGcalStore.getState().setSyncFailed(true);
        });
    }, AUTOSYNC_INTERVAL_MS);
  }

  private stopAutoSync(): void {
    if (this.autoSyncTimer !== null) {
      window.clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }

  private decorate(
    event: GcalEvent,
    calendarId: string,
    calendars: GcalCalendar[],
  ): GcalAgendaEvent {
    const calendar = calendars.find((entry) => entry.id === calendarId);
    return {
      ...event,
      calendarId,
      calendarColor: calendar?.backgroundColor ?? calendar?.foregroundColor,
    };
  }

  private async encryptEvent(event: GcalEvent): Promise<EncryptedPayload> {
    return this.deps.crypto.encryptBlob(
      new TextEncoder().encode(JSON.stringify(event)),
      gcalEventAad(event.id),
    );
  }

  private async persistTokenBlob(blob: TokenBlob): Promise<void> {
    const payload = await this.deps.crypto.encryptBlob(
      new TextEncoder().encode(JSON.stringify(blob)),
      gcalTokenAad(),
    );
    await this.deps.repo.putTokenPayload(payload);
  }

  private assertWritableScope(scope: string): void {
    if (!scope.split(" ").includes(GCAL_SCOPE)) {
      useGcalStore.getState().setStatus("reauth");
      throw new GcalReauthError(
        "Cove was granted read-only access. Revoke it at https://myaccount.google.com/permissions, then reconnect and keep the full permission checked.",
      );
    }
  }

  private async ensureAccessToken(): Promise<string> {
    await this.ensureLoaded();
    if (!this.tokenBlob) {
      throw new GcalReauthError("Google Calendar is not connected.");
    }
    if (this.access && Date.now() < this.access.expiresAtMs - 60_000) {
      return this.access.accessToken;
    }
    this.inflightRefresh ??= this.refreshAccessToken()
      .catch((err) => {
        const message = String((err as Error)?.message ?? err);
        if (message.includes("invalid_grant")) {
          useGcalStore.getState().setStatus("reauth");
          throw new GcalReauthError(
            "Google rejected the saved sign-in. Please reconnect Google Calendar.",
          );
        }
        throw err;
      })
      .finally(() => {
        this.inflightRefresh = null;
      });
    return (await this.inflightRefresh).accessToken;
  }

  private async refreshAccessToken(): Promise<GcalAccessToken> {
    if (!this.tokenBlob) throw new GcalReauthError("Google Calendar is not connected.");
    const clientId = this.tokenBlob.clientId || this.clientId();
    const clientSecret = this.tokenBlob.clientSecret || getGcalClientSecret();
    if (!clientId || !clientSecret) {
      useGcalStore.getState().setStatus("reauth");
      throw new GcalReauthError(
        "Add your Google client ID and secret in Settings > Connections, then reconnect.",
      );
    }
    const refreshed = await invoke<GcalAccessToken>("gcal_refresh", {
      clientId,
      clientSecret,
      refreshToken: this.tokenBlob.refreshToken,
    });
    if (!this.tokenBlob.clientId || !this.tokenBlob.clientSecret) {
      this.tokenBlob = { ...this.tokenBlob, clientId, clientSecret };
      void this.persistTokenBlob(this.tokenBlob).catch(() => {});
    }
    this.assertWritableScope(refreshed.scope);
    this.access = refreshed;
    return refreshed;
  }
}

const MESSAGES_TITLE = "Cove";
const MESSAGES_UNTITLED = "(No title)";

const timeLabel = (event: GcalEvent): string =>
  new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(event.start.dateTime as string),
  );
