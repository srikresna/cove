import { invoke } from "@tauri-apps/api/core";
import { getGcalClientId, getGcalClientSecret } from "../../config/gcal";
import type { EncryptedPayload } from "../../domain/EncryptedPayload";
import type {
  GcalAccessToken,
  GcalCalendar,
  GcalEvent,
  GcalEventInput,
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
}

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

  async restore(): Promise<void> {
    const store = useGcalStore.getState();
    try {
      const payload = await this.deps.repo.getTokenPayload();
      if (!payload) {
        this.restoreAttempted = true;
        store.setStatus("disconnected");
        return;
      }
      const blob = JSON.parse(
        new TextDecoder().decode(await this.deps.crypto.decryptBlob(payload, gcalTokenAad())),
      ) as Partial<TokenBlob>;
      this.tokenBlob = {
        refreshToken: blob.refreshToken ?? "",
        scope: blob.scope ?? "",
        email: blob.email ?? null,
        clientId: blob.clientId ?? "",
        clientSecret: blob.clientSecret ?? "",
      };
      this.restoreAttempted = true;
      store.setStatus("connected");
      store.setAccountEmail(this.tokenBlob.email);
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
    this.tokenBlob = null;
    this.access = null;
    this.restoreAttempted = false;
    const store = useGcalStore.getState();
    store.reset();
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
      try {
        const primary = await invoke<GcalCalendar>("gcal_primary_calendar", {
          accessToken: tokens.accessToken,
        });
        email = primary?.id ?? null;
      } catch {
        // The events scope cannot always read calendar metadata — email stays unknown.
      }
      const blob: TokenBlob = {
        refreshToken: tokens.refreshToken,
        scope: tokens.scope,
        email,
        clientId: this.clientId(),
        clientSecret: getGcalClientSecret(),
      };
      await this.persistTokenBlob(blob);
      this.tokenBlob = blob;

      store.setStatus("connected");
      store.setAccountEmail(blob.email);
    } catch (err) {
      if (!this.tokenBlob && !(err instanceof GcalReauthError)) store.setStatus("disconnected");
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
    return calendars;
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
    useGcalStore.getState().setLastSyncAt(Date.now());
    return live;
  }

  async loadCachedWindow(
    fromMs: number,
    toMs: number,
  ): Promise<Array<{ calendarId: string; event: GcalEvent }>> {
    const rows = await this.deps.repo.listEventsBetween(fromMs, toMs);
    const out: Array<{ calendarId: string; event: GcalEvent }> = [];
    for (const row of rows) {
      try {
        const event = JSON.parse(
          new TextDecoder().decode(
            await this.deps.crypto.decryptBlob(row.payload, gcalEventAad(row.id)),
          ),
        ) as GcalEvent;
        out.push({ calendarId: row.calendarId, event });
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
