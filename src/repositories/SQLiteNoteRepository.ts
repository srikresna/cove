import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { EncryptedPayload } from "../services/vault/IEncryptionService";
import type { INoteRepository, NoteRecord } from "./INoteRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

/**
 * Rows encrypted under the session DEK carry kmsVersion = 1; 0 marks pre-vault
 * legacy rows still awaiting migration. Stamped on every content write so
 * migration/rotation sweeps can tell the two apart.
 */
const KMS_VERSION_DEK = 1;

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
      isPinned: Boolean(row.isPinned),
      isFavorite: Boolean(row.isFavorite),
      createdAt: Number(row.createdAt),
      updatedAt: Number(row.updatedAt),
    };
  }

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, title, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE workspaceId = ? ORDER BY updatedAt DESC, id DESC",
        [workspaceId],
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("getNotesMetadataByWorkspace", err);
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
        "SELECT * FROM notes ORDER BY updatedAt DESC LIMIT ?",
        [limit],
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("findRecentForSearch", err);
    }
  }

  async searchTitlesFts(query: string, limit: number): Promise<NoteSearchHit[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT n.id, n.workspaceId, n.title, n.icon FROM notes_fts f JOIN notes n ON n.id = f.note_id WHERE notes_fts MATCH ? ORDER BY rank LIMIT ?",
        [`${query}*`, limit],
      );
      return rows.map((r) => ({
        id: String(r.id),
        workspaceId: String(r.workspaceId),
        title: String(r.title),
        icon: r.icon ? String(r.icon) : undefined,
        snippet: "",
      }));
    } catch {
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
    const db = await this.getDb();
    try {
      await db.execute("DELETE FROM notes WHERE id = ?", [id]);
    } catch (err) {
      throw toPersistenceError("deleteNote", err);
    }
  }

  async deleteNotesByWorkspace(workspaceId: string): Promise<void> {
    const db = await this.getDb();
    try {
      await db.execute("DELETE FROM notes WHERE workspaceId = ?", [workspaceId]);
    } catch (err) {
      throw toPersistenceError("deleteNotesByWorkspace", err);
    }
  }
}
