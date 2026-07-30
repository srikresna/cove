import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import { Logger } from "../services/Logger";
import type { EncryptedPayload } from "../services/vault/IEncryptionService";
import type { INoteRepository, NoteRecord } from "./INoteRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

// 1 = encrypted under the session DEK; 0 = pre-vault legacy row awaiting migration.
const KMS_VERSION_DEK = 1;

// FTS5 treats a raw query as query-syntax (operators, column filters, phrase
// quotes), so a title containing `"`, `(`, `:` or operator words throws a syntax
// error that would silently yield zero results. Wrap each token as a phrase so
// the user's literal text is matched; returns "" when nothing usable remains.
function sanitizeFtsQuery(query: string): string {
  const phrases: string[] = [];
  for (const token of query.trim().split(/\s+/)) {
    const escaped = token.replace(/"/g, "");
    if (escaped) phrases.push(`"${escaped}"`);
  }
  return phrases.join(" ");
}

export class SQLiteNoteRepository implements INoteRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  private mapRowToRecord(row: Record<string, unknown>): NoteRecord {
    return {
      id: String(row.id),
      workspaceId: String(row.workspaceId),
      title: String(row.title),
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
        "SELECT id, workspaceId, title, icon, coverColor, docMode, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE workspaceId = ? AND deletedAt IS NULL ORDER BY updatedAt DESC, id DESC",
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
        `SELECT id, workspaceId, title, icon, coverColor, docMode, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE id IN (${placeholders})`,
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

  async searchTitlesFts(query: string, limit: number): Promise<NoteSearchHit[]> {
    const ftsQuery = sanitizeFtsQuery(query);
    if (!ftsQuery) return [];
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT n.id, n.workspaceId, n.title, n.icon FROM notes_fts f JOIN notes n ON n.id = f.note_id WHERE notes_fts MATCH ? AND n.deletedAt IS NULL ORDER BY rank LIMIT ?",
        [ftsQuery, limit],
      );
      return rows.map((r) => ({
        id: String(r.id),
        workspaceId: String(r.workspaceId),
        title: String(r.title),
        icon: r.icon ? String(r.icon) : undefined,
        snippet: "",
      }));
    } catch (err) {
      // FTS may be unavailable (SQLite build without FTS5) or the index corrupt;
      // degrade to empty rather than aborting search. Body search still runs.
      Logger.warn("searchTitlesFts failed; returning empty results", err, { query });
      return [];
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
        (id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, kmsVersion, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.workspaceId,
          note.title,
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
      setClauses.push("title = ?");
      params.push(updates.title);
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

  // Single statement on a foreign_keys=ON transaction connection: the schema's
  // ON DELETE CASCADE removes note_links/tags/covers/properties atomically.
  async deleteNote(id: string): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction([
        { sql: "DELETE FROM notes WHERE id = ?", params: [id] },
      ]);
    } catch (err) {
      throw toPersistenceError("deleteNote", err);
    }
  }

  async deleteNotesByWorkspace(workspaceId: string): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction([
        { sql: "DELETE FROM notes WHERE workspaceId = ?", params: [workspaceId] },
      ]);
    } catch (err) {
      throw toPersistenceError("deleteNotesByWorkspace", err);
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
        "SELECT id, workspaceId, title, icon, coverColor, docMode, isPinned, isFavorite, createdAt, updatedAt, deletedAt FROM notes WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC",
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("listTrashed", err);
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
