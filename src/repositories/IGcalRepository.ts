import type { EncryptedPayload } from "../domain/EncryptedPayload";

export interface GcalEventRow {
  id: string;
  calendarId: string;
  startsAt: number;
  endsAt: number;
  payload: EncryptedPayload;
}

export interface IGcalRepository {
  getTokenPayload(): Promise<EncryptedPayload | null>;
  putTokenPayload(payload: EncryptedPayload): Promise<void>;
  clearToken(): Promise<void>;

  listEventsBetween(fromMs: number, toMs: number): Promise<GcalEventRow[]>;
  replaceWindow(
    calendarId: string,
    fromMs: number,
    toMs: number,
    rows: Array<{ id: string; startsAt: number; endsAt: number; payload: EncryptedPayload }>,
  ): Promise<void>;
  upsertEvent(row: {
    id: string;
    calendarId: string;
    startsAt: number;
    endsAt: number;
    payload: EncryptedPayload;
  }): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  clearEvents(): Promise<void>;
}
