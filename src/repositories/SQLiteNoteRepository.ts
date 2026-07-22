import type { Note } from "../domain/note/Note";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import { EncryptionService } from "../services/EncryptionService";
import type { INoteRepository } from "./INoteRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

export class SQLiteNoteRepository implements INoteRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  constructor() {
    this.initSchema();
  }

  private async mapRowToNote(
    row: Record<string, unknown>,
    opts: { decrypt: boolean },
  ): Promise<Note> {
    return {
      id: String(row.id),
      workspaceId: String(row.workspaceId),
      title: String(row.title),
      content: opts.decrypt
        ? await EncryptionService.decryptPayload(String(row.content ?? ""))
        : row.content != null
          ? String(row.content)
          : "",
      icon: row.icon ? String(row.icon) : undefined,
      coverColor: row.coverColor ? String(row.coverColor) : undefined,
      isPinned: Boolean(row.isPinned),
      isFavorite: Boolean(row.isFavorite),
      createdAt: Number(row.createdAt),
      updatedAt: Number(row.updatedAt),
    };
  }

  private async initSchema() {
    try {
      const db = await this.getDb();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          workspaceId TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          icon TEXT,
          coverColor TEXT,
          isPinned INTEGER NOT NULL DEFAULT 0,
          isFavorite INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
        )
      `);
      await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_workspaceId ON notes(workspaceId)");

      const versionRows = await db.select<Array<{ user_version: number }>>("PRAGMA user_version");
      const version = versionRows[0]?.user_version ?? 0;

      if (version < 2) {
        const cols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
        if (cols.some((c) => c.name === "folderId")) {
          await SQLiteDatabase.withTransaction(async (txDb) => {
            await txDb.execute(
              "CREATE TABLE notes_new (id TEXT PRIMARY KEY, workspaceId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, icon TEXT, coverColor TEXT, isPinned INTEGER NOT NULL DEFAULT 0, isFavorite INTEGER NOT NULL DEFAULT 0, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE)",
            );
            await txDb.execute(
              "INSERT INTO notes_new (id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt) SELECT id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt FROM notes",
            );
            await txDb.execute("DROP TABLE notes");
            await txDb.execute("ALTER TABLE notes_new RENAME TO notes");
            await txDb.execute(
              "CREATE INDEX IF NOT EXISTS idx_notes_workspaceId ON notes(workspaceId)",
            );
            await txDb.execute("PRAGMA user_version = 2");
          });
        } else {
          await db.execute("PRAGMA user_version = 2");
        }
      }
    } catch (err) {
      throw toPersistenceError("initSchema", err);
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes ORDER BY updatedAt DESC",
      );
      return Promise.all(rows.map((row) => this.mapRowToNote(row, { decrypt: true })));
    } catch (err) {
      throw toPersistenceError("getAllNotes", err);
    }
  }

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, title, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE workspaceId = ? ORDER BY updatedAt DESC",
        [workspaceId],
      );
      return Promise.all(rows.map((row) => this.mapRowToNote(row, { decrypt: false })));
    } catch (err) {
      throw toPersistenceError("getNotesMetadataByWorkspace", err);
    }
  }

  async getNotesByWorkspace(workspaceId: string): Promise<Note[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes WHERE workspaceId = ? ORDER BY updatedAt DESC",
        [workspaceId],
      );
      return Promise.all(rows.map((row) => this.mapRowToNote(row, { decrypt: true })));
    } catch (err) {
      throw toPersistenceError("getNotesByWorkspace", err);
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes WHERE id = ?",
        [id],
      );
      if (!rows.length || !rows[0]) return null;
      return this.mapRowToNote(rows[0], { decrypt: true });
    } catch (err) {
      throw toPersistenceError("getNoteById", err);
    }
  }

  async createNote(noteInput: Omit<Note, "createdAt" | "updatedAt">): Promise<Note> {
    const db = await this.getDb();
    const now = Date.now();
    const encryptedContent = await EncryptionService.encryptPayload(noteInput.content);

    const note: Note = {
      ...noteInput,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.execute(
        `INSERT INTO notes 
        (id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.workspaceId,
          note.title,
          encryptedContent,
          note.icon || null,
          note.coverColor || null,
          note.isPinned ? 1 : 0,
          note.isFavorite ? 1 : 0,
          note.createdAt,
          note.updatedAt,
        ],
      );
    } catch (err) {
      throw toPersistenceError("createNote", err);
    }

    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
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
      const encrypted = await EncryptionService.encryptPayload(updates.content);
      setClauses.push("content = ?");
      params.push(encrypted);
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

  async searchNotes(query: string): Promise<Note[]> {
    const allNotes = await this.getAllNotes();
    const q = query.toLowerCase();
    return allNotes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    );
  }
}
