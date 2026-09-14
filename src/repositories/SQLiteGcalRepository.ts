import type { EncryptedPayload } from "../domain/EncryptedPayload";
import { toPersistenceError } from "../errors/errorMappers";
import type { GcalEventRow, IGcalRepository } from "./IGcalRepository";
import { SQLiteDatabase, type SqlStatement } from "./SQLiteDatabase";

const KMS_VERSION_DEK = 1;

export class SQLiteGcalRepository implements IGcalRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async getTokenPayload(): Promise<EncryptedPayload | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ payload: string }>>(
        "SELECT payload FROM gcal_tokens WHERE id = 1",
      );
      const payload = rows[0]?.payload;
      return payload ? (payload as EncryptedPayload) : null;
    } catch (err) {
      throw toPersistenceError("gcal.getToken", err);
    }
  }

  async putTokenPayload(payload: EncryptedPayload): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO gcal_tokens (id, payload, kmsVersion, updatedAt) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, kmsVersion = excluded.kmsVersion, updatedAt = excluded.updatedAt",
        [payload, KMS_VERSION_DEK, Date.now()],
      );
    } catch (err) {
      throw toPersistenceError("gcal.putToken", err);
    }
  }

  async clearToken(): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM gcal_tokens WHERE id = 1");
    } catch (err) {
      throw toPersistenceError("gcal.clearToken", err);
    }
  }

  async listEventsBetween(fromMs: number, toMs: number): Promise<GcalEventRow[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<
        Array<{ id: string; calendarId: string; startsAt: number; endsAt: number; payload: string }>
      >(
        "SELECT id, calendarId, startsAt, endsAt, payload FROM gcal_events WHERE startsAt < ? AND endsAt > ? ORDER BY startsAt ASC",
        [toMs, fromMs],
      );
      return rows.map((row) => ({
        id: row.id,
        calendarId: row.calendarId,
        startsAt: Number(row.startsAt),
        endsAt: Number(row.endsAt),
        payload: row.payload as EncryptedPayload,
      }));
    } catch (err) {
      throw toPersistenceError("gcal.listEvents", err);
    }
  }

  async replaceWindow(
    calendarId: string,
    fromMs: number,
    toMs: number,
    rows: Array<{ id: string; startsAt: number; endsAt: number; payload: EncryptedPayload }>,
  ): Promise<void> {
    const statements: SqlStatement[] = [
      {
        sql: "DELETE FROM gcal_events WHERE calendarId = ? AND startsAt < ? AND endsAt > ?",
        params: [calendarId, toMs, fromMs],
      },
      ...this.insertStatements(calendarId, rows),
    ];
    try {
      await SQLiteDatabase.runTransaction(statements);
    } catch (err) {
      throw toPersistenceError("gcal.replaceWindow", err);
    }
  }

  async upsertEvent(row: {
    id: string;
    calendarId: string;
    startsAt: number;
    endsAt: number;
    payload: EncryptedPayload;
  }): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction(this.insertStatements(row.calendarId, [row]));
    } catch (err) {
      throw toPersistenceError("gcal.upsertEvent", err);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM gcal_events WHERE id = ?", [id]);
    } catch (err) {
      throw toPersistenceError("gcal.deleteEvent", err);
    }
  }

  async clearEvents(): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM gcal_events");
    } catch (err) {
      throw toPersistenceError("gcal.clearEvents", err);
    }
  }

  private insertStatements(
    calendarId: string,
    rows: Array<{ id: string; startsAt: number; endsAt: number; payload: EncryptedPayload }>,
  ): SqlStatement[] {
    const now = Date.now();
    return rows.map((row) => ({
      sql: "INSERT INTO gcal_events (id, calendarId, payload, startsAt, endsAt, kmsVersion, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, startsAt = excluded.startsAt, endsAt = excluded.endsAt, updatedAt = excluded.updatedAt",
      params: [row.id, calendarId, row.payload, row.startsAt, row.endsAt, KMS_VERSION_DEK, now],
    }));
  }
}
