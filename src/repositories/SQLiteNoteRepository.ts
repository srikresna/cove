import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { EncryptedPayload } from "../services/vault/IEncryptionService";
import type { INoteRepository, NoteRecord } from "./INoteRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

const KMS_VERSION_DEK = 1;

export class SQLiteNoteRepository implements INoteRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  private mapRowToRecord(row: Record<string, unknown>): NoteRecord {
    return {
      id: String(row.id),
      workspaceId: String(row.workspaceId),
      title: String(row.title) as EncryptedPayload,
      titleKmsVersion: Number(row.titleKmsVersion ?? 0),
      content: (row.content != null ? String(row.content) : "") as EncryptedPayload,
      icon: row.icon ? String(row.icon) : undefined,
      coverColor: row.coverColor ? String(row.coverColor) : undefined,
      docMode: row.docMode === "edgeless" ? "edgeless" : undefined,
      isPinned: Boolean(row.isPinned),
      isFavorite: Boolean(row.isFavorite),
      createdAt: Number(row.createdAt),
      updatedAt: Number(row.updatedAt),
      deletedAt: row.deletedAt != null ? Number(row.deletedAt) : undefined,
    };
  }

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, title, titleKmsVersion, icon, coverColor, docMode, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE workspaceId = ? AND deletedAt IS NULL ORDER BY updatedAt DESC, id DESC",
        [workspaceId],
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("getNotesMetadataByWorkspace", err);
    }
  }

  async getMetaByIds(ids: string[]): Promise<NoteRecord[]> {
    if (ids.length === 0) return [];
    try {
      const db = await this.getDb();
      const placeholders = ids.map(() => "?").join(", ");
      const rows = await db.select<Array<Record<string, unknown>>>(
        `SELECT id, workspaceId, title, titleKmsVersion, icon, coverColor, docMode, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE id IN (${placeholders})`,
        ids,
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("getMetaByIds", err);
    }
  }

  async getNoteById(id: string): Promise<NoteRecord | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes WHERE id = ?",
        [id],
      );
      if (!rows.length || !rows[0]) return null;
      return this.mapRowToRecord(rows[0]);
    } catch (err) {
      throw toPersistenceError("getNoteById", err);
    }
  }

  async findRecentForSearch(limit: number): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes WHERE deletedAt IS NULL ORDER BY updatedAt DESC LIMIT ?",
        [limit],
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("findRecentForSearch", err);
    }
  }

  async createNote(noteInput: Omit<NoteRecord, "createdAt" | "updatedAt">): Promise<NoteRecord> {
    const db = await this.getDb();
    const now = Date.now();

    const note: NoteRecord = {
      ...noteInput,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.execute(
        `INSERT INTO notes
        (id, workspaceId, title, titleKmsVersion, content, icon, coverColor, isPinned, isFavorite, kmsVersion, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.workspaceId,
          note.title,
          note.titleKmsVersion,
          note.content,
          note.icon || null,
          note.coverColor || null,
          note.isPinned ? 1 : 0,
          note.isFavorite ? 1 : 0,
          KMS_VERSION_DEK,
          note.createdAt,
          note.updatedAt,
        ],
      );
    } catch (err) {
      throw toPersistenceError("createNote", err);
    }

    return note;
  }

  async updateNote(id: string, updates: Partial<NoteRecord>): Promise<NoteRecord> {
    const db = await this.getDb();
    const now = Date.now();

    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (updates.workspaceId !== undefined) {
      setClauses.push("workspaceId = ?");
      params.push(updates.workspaceId);
    }
    if (updates.title !== undefined) {
      setClauses.push("title = ?", "titleKmsVersion = ?");
      params.push(updates.title, KMS_VERSION_DEK);
    }
    if (updates.content !== undefined) {
      setClauses.push("content = ?", "kmsVersion = ?");
      params.push(updates.content, KMS_VERSION_DEK);
    }
    if (updates.icon !== undefined) {
      setClauses.push("icon = ?");
      params.push(updates.icon || null);
    }
    if (updates.coverColor !== undefined) {
      setClauses.push("coverColor = ?");
      params.push(updates.coverColor || null);
    }
    if (updates.docMode !== undefined) {
      setClauses.push("docMode = ?");
      params.push(updates.docMode === "edgeless" ? "edgeless" : null);
    }
    if (updates.isPinned !== undefined) {
      setClauses.push("isPinned = ?");
      params.push(updates.isPinned ? 1 : 0);
    }
    if (updates.isFavorite !== undefined) {
      setClauses.push("isFavorite = ?");
      params.push(updates.isFavorite ? 1 : 0);
    }

    setClauses.push("updatedAt = ?");
    params.push(now);
    params.push(id);

    try {
      await db.execute(`UPDATE notes SET ${setClauses.join(", ")} WHERE id = ?`, params);
    } catch (err) {
      throw toPersistenceError("updateNote", err);
    }

    const existing = await this.getNoteById(id);
    if (!existing) throw new PersistenceError("updateNote", `Note not found after update: ${id}`);
    return existing;
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction([
        { sql: "DELETE FROM notes WHERE id = ?", params: [id] },
      ]);
    } catch (err) {
      throw toPersistenceError("deleteNote", err);
    }
  }

  async getCover(noteId: string): Promise<EncryptedPayload | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ payload: string }>>(
        "SELECT payload FROM note_covers WHERE noteId = ?",
        [noteId],
      );
      const payload = rows[0]?.payload;
      return payload ? (payload as EncryptedPayload) : null;
    } catch (err) {
      throw toPersistenceError("getCover", err);
    }
  }

  async upsertCover(noteId: string, payload: EncryptedPayload): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO note_covers (noteId, payload, kmsVersion, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(noteId) DO UPDATE SET payload = excluded.payload, kmsVersion = excluded.kmsVersion, updatedAt = excluded.updatedAt",
        [noteId, payload, KMS_VERSION_DEK, Date.now()],
      );
    } catch (err) {
      throw toPersistenceError("upsertCover", err);
    }
  }

  async deleteCover(noteId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM note_covers WHERE noteId = ?", [noteId]);
    } catch (err) {
      throw toPersistenceError("deleteCover", err);
    }
  }

  async listTrashed(): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, title, icon, coverColor, docMode, isPinned, isFavorite, createdAt, updatedAt, deletedAt, titleKmsVersion FROM notes WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC",
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("listTrashed", err);
    }
  }

  async getAllContents(): Promise<Array<{ id: string; content: EncryptedPayload }>> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ id: string; content: EncryptedPayload }>>(
        "SELECT id, content FROM notes",
      );
      return rows ?? [];
    } catch (err) {
      throw toPersistenceError("getAllContents", err);
    }
  }

  async setDeleted(id: string, deletedAt: number | null): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("UPDATE notes SET deletedAt = ? WHERE id = ?", [deletedAt, id]);
    } catch (err) {
      throw toPersistenceError("setDeleted", err);
    }
  }

  async findExpiredTrash(cutoff: number): Promise<string[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ id: string }>>(
        "SELECT id FROM notes WHERE deletedAt IS NOT NULL AND deletedAt < ?",
        [cutoff],
      );
      return rows.map((r) => String(r.id));
    } catch (err) {
      throw toPersistenceError("findExpiredTrash", err);
    }
  }
}
