import type { EncryptedPayload } from "../domain/EncryptedPayload";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { INoteRepository, NoteRecord } from "./INoteRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

const KMS_VERSION_DEK = 1;

// The SELECT column list every list-shaped notes query must match. Kept next
// to the row type it produces so a mapper field with no column fails loudly
// instead of silently defaulting.
const NOTE_META_COLUMNS =
  "id, workspaceId, title, titleKmsVersion, icon, coverColor, docMode, edgelessTheme, pageWidth, isTemplate, isPinned, isFavorite, orderIndex, createdAt, updatedAt";

interface NoteRow {
  id: string;
  workspaceId: string;
  title: string;
  titleKmsVersion: number;
  icon: string | null;
  coverColor: string | null;
  docMode: string | null;
  edgelessTheme: string | null;
  pageWidth: string | null;
  isTemplate: number;
  isPinned: number;
  isFavorite: number;
  orderIndex: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
  content?: string;
  kmsVersion?: number;
}

const NOTE_ROW_KEYS = [
  "id",
  "workspaceId",
  "title",
  "titleKmsVersion",
  "icon",
  "coverColor",
  "docMode",
  "edgelessTheme",
  "pageWidth",
  "isTemplate",
  "isPinned",
  "isFavorite",
  "orderIndex",
  "createdAt",
  "updatedAt",
] as const satisfies ReadonlyArray<keyof NoteRow>;

export class SQLiteNoteRepository implements INoteRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  private mapRowToRecord(row: NoteRow): NoteRecord {
    for (const key of NOTE_ROW_KEYS) {
      if (!(key in row)) {
        throw new PersistenceError(
          "mapRowToRecord",
          `notes SELECT is missing the mapped column: ${key}`,
        );
      }
    }
    return {
      id: row.id,
      workspaceId: row.workspaceId,
      title: row.title as EncryptedPayload,
      titleKmsVersion: row.titleKmsVersion,
      content: (row.content ?? "") as EncryptedPayload,
      icon: row.icon ?? undefined,
      coverColor: row.coverColor ?? undefined,
      docMode: row.docMode === "edgeless" ? "edgeless" : undefined,
      edgelessTheme:
        row.edgelessTheme === "light" || row.edgelessTheme === "dark"
          ? row.edgelessTheme
          : undefined,
      pageWidth: row.pageWidth === "fullWidth" ? "fullWidth" : undefined,
      isTemplate: Boolean(row.isTemplate),
      isPinned: Boolean(row.isPinned),
      isFavorite: Boolean(row.isFavorite),
      orderIndex: row.orderIndex ? row.orderIndex : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt != null ? row.deletedAt : undefined,
    };
  }

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<NoteRow>>(
        `SELECT ${NOTE_META_COLUMNS} FROM notes WHERE workspaceId = ? AND deletedAt IS NULL ORDER BY updatedAt DESC, id DESC`,
        [workspaceId],
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("getNotesMetadataByWorkspace", err);
    }
  }

  async getMaxOrderIndex(workspaceId: string): Promise<string | null> {
    try {
      const db = await this.getDb();
      // Deliberately includes soft-trashed rows: minting above only the live
      // max would re-mint a trashed note's key, colliding on restore.
      const rows = await db.select<Array<{ orderIndex: string }>>(
        "SELECT orderIndex FROM notes WHERE workspaceId = ? AND orderIndex != '' ORDER BY orderIndex DESC LIMIT 1",
        [workspaceId],
      );
      const row = rows[0];
      return row?.orderIndex ? String(row.orderIndex) : null;
    } catch (err) {
      throw toPersistenceError("getMaxOrderIndex", err);
    }
  }

  async getOrderIndexesByWorkspace(
    workspaceId: string,
  ): Promise<Array<{ id: string; orderIndex: string }>> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ id: string; orderIndex: string }>>(
        "SELECT id, orderIndex FROM notes WHERE workspaceId = ? AND orderIndex != ''",
        [workspaceId],
      );
      return rows;
    } catch (err) {
      throw toPersistenceError("getOrderIndexesByWorkspace", err);
    }
  }

  async getMetaByIds(ids: string[]): Promise<NoteRecord[]> {
    if (ids.length === 0) return [];
    try {
      const db = await this.getDb();
      const placeholders = ids.map(() => "?").join(", ");
      const rows = await db.select<Array<NoteRow>>(
        `SELECT ${NOTE_META_COLUMNS} FROM notes WHERE id IN (${placeholders})`,
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
      const rows = await db.select<Array<NoteRow>>("SELECT * FROM notes WHERE id = ?", [id]);
      if (!rows.length || !rows[0]) return null;
      return this.mapRowToRecord(rows[0]);
    } catch (err) {
      throw toPersistenceError("getNoteById", err);
    }
  }

  async findRecentForSearch(limit: number): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<NoteRow>>(
        "SELECT * FROM notes WHERE deletedAt IS NULL ORDER BY updatedAt DESC LIMIT ?",
        [limit],
      );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("findRecentForSearch", err);
    }
  }

  async findNotesForKeyset(
    limit: number,
    cursor?: { updatedAt: number; id: string },
  ): Promise<NoteRecord[]> {
    try {
      const db = await this.getDb();
      const rows = cursor
        ? await db.select<Array<NoteRow>>(
            "SELECT * FROM notes WHERE deletedAt IS NULL AND (updatedAt < ? OR (updatedAt = ? AND id < ?)) ORDER BY updatedAt DESC, id DESC LIMIT ?",
            [cursor.updatedAt, cursor.updatedAt, cursor.id, limit],
          )
        : await db.select<Array<NoteRow>>(
            "SELECT * FROM notes WHERE deletedAt IS NULL ORDER BY updatedAt DESC, id DESC LIMIT ?",
            [limit],
          );
      return rows.map((row) => this.mapRowToRecord(row));
    } catch (err) {
      throw toPersistenceError("findNotesForKeyset", err);
    }
  }

  async createNote(
    noteInput: Omit<NoteRecord, "createdAt" | "updatedAt">,
    opts?: { createdAt?: number },
  ): Promise<NoteRecord> {
    const db = await this.getDb();
    const now = Date.now();

    const note: NoteRecord = {
      ...noteInput,
      createdAt: opts?.createdAt ?? now,
      updatedAt: now,
    };

    try {
      await db.execute(
        `INSERT INTO notes
        (id, workspaceId, title, titleKmsVersion, content, icon, coverColor, docMode, edgelessTheme, pageWidth, isTemplate, isPinned, isFavorite, orderIndex, kmsVersion, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.workspaceId,
          note.title,
          note.titleKmsVersion,
          note.content,
          note.icon || null,
          note.coverColor || null,
          note.docMode === "edgeless" ? "edgeless" : null,
          note.edgelessTheme === "light" || note.edgelessTheme === "dark"
            ? note.edgelessTheme
            : null,
          note.pageWidth === "fullWidth" ? "fullWidth" : null,
          note.isTemplate ? 1 : 0,
          note.isPinned ? 1 : 0,
          note.isFavorite ? 1 : 0,
          // The column is NOT NULL — an unset key must bind the empty-string
          // default, never SQL NULL (explicit NULLs bypass the DEFAULT).
          note.orderIndex ?? "",
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
    if (updates.edgelessTheme !== undefined) {
      setClauses.push("edgelessTheme = ?");
      params.push(
        updates.edgelessTheme === "light" || updates.edgelessTheme === "dark"
          ? updates.edgelessTheme
          : null,
      );
    }
    if (updates.pageWidth !== undefined) {
      setClauses.push("pageWidth = ?");
      params.push(updates.pageWidth === "fullWidth" ? "fullWidth" : "standard");
    }
    if (updates.isTemplate !== undefined) {
      setClauses.push("isTemplate = ?");
      params.push(updates.isTemplate ? 1 : 0);
    }
    if (updates.isPinned !== undefined) {
      setClauses.push("isPinned = ?");
      params.push(updates.isPinned ? 1 : 0);
    }
    if (updates.isFavorite !== undefined) {
      setClauses.push("isFavorite = ?");
      params.push(updates.isFavorite ? 1 : 0);
    }
    if (updates.orderIndex !== undefined) {
      setClauses.push("orderIndex = ?");
      params.push(updates.orderIndex ?? "");
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
      const rows = await db.select<Array<NoteRow>>(
        `SELECT ${NOTE_META_COLUMNS}, deletedAt FROM notes WHERE deletedAt IS NOT NULL ORDER BY deletedAt DESC`,
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
