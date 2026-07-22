import { EncryptionService } from "../services/EncryptionService";
import type { Note } from "../types";
import type { INoteRepository } from "./INoteRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

export class SQLiteNoteRepository implements INoteRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  constructor() {
    this.initSchema();
  }

  private async initSchema() {
    try {
      const db = await this.getDb();
      await db.execute("BEGIN TRANSACTION");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS notes (
          id TEXT PRIMARY KEY,
          workspaceId TEXT NOT NULL,
          folderId TEXT,
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
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_notes_workspaceId ON notes(workspaceId)
      `);
      await db.execute("COMMIT");
    } catch (err) {
      console.error("SQLiteNoteRepository initSchema error:", err);
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes ORDER BY updatedAt DESC",
      );

      return Promise.all(
        rows.map(async (row) => ({
          id: String(row.id),
          workspaceId: String(row.workspaceId),
          folderId: row.folderId ? String(row.folderId) : undefined,
          title: String(row.title),
          content: await EncryptionService.decryptPayload(String(row.content)),
          icon: row.icon ? String(row.icon) : undefined,
          coverColor: row.coverColor ? String(row.coverColor) : undefined,
          isPinned: Boolean(row.isPinned),
          isFavorite: Boolean(row.isFavorite),
          createdAt: Number(row.createdAt),
          updatedAt: Number(row.updatedAt),
        })),
      );
    } catch (err) {
      console.error("SQLiteNoteRepository getAllNotes error:", err);
      return [];
    }
  }

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, folderId, title, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt FROM notes WHERE workspaceId = ? ORDER BY updatedAt DESC",
        [workspaceId],
      );

      return rows.map((row) => ({
        id: String(row.id),
        workspaceId: String(row.workspaceId),
        folderId: row.folderId ? String(row.folderId) : undefined,
        title: String(row.title),
        content: "",
        icon: row.icon ? String(row.icon) : undefined,
        coverColor: row.coverColor ? String(row.coverColor) : undefined,
        isPinned: Boolean(row.isPinned),
        isFavorite: Boolean(row.isFavorite),
        createdAt: Number(row.createdAt),
        updatedAt: Number(row.updatedAt),
      }));
    } catch (err) {
      console.error("SQLiteNoteRepository getNotesMetadataByWorkspace error:", err);
      return [];
    }
  }

  async getNotesByWorkspace(workspaceId: string): Promise<Note[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes WHERE workspaceId = ? ORDER BY updatedAt DESC",
        [workspaceId],
      );

      return Promise.all(
        rows.map(async (row) => ({
          id: String(row.id),
          workspaceId: String(row.workspaceId),
          folderId: row.folderId ? String(row.folderId) : undefined,
          title: String(row.title),
          content: await EncryptionService.decryptPayload(String(row.content)),
          icon: row.icon ? String(row.icon) : undefined,
          coverColor: row.coverColor ? String(row.coverColor) : undefined,
          isPinned: Boolean(row.isPinned),
          isFavorite: Boolean(row.isFavorite),
          createdAt: Number(row.createdAt),
          updatedAt: Number(row.updatedAt),
        })),
      );
    } catch (err) {
      console.error("SQLiteNoteRepository getNotesByWorkspace error:", err);
      return [];
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT * FROM notes WHERE id = ?",
        [id],
      );

      if (!rows.length) return null;
      const row = rows[0];

      return {
        id: String(row.id),
        workspaceId: String(row.workspaceId),
        folderId: row.folderId ? String(row.folderId) : undefined,
        title: String(row.title),
        content: await EncryptionService.decryptPayload(String(row.content)),
        icon: row.icon ? String(row.icon) : undefined,
        coverColor: row.coverColor ? String(row.coverColor) : undefined,
        isPinned: Boolean(row.isPinned),
        isFavorite: Boolean(row.isFavorite),
        createdAt: Number(row.createdAt),
        updatedAt: Number(row.updatedAt),
      };
    } catch (err) {
      console.error("SQLiteNoteRepository getNoteById error:", err);
      return null;
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
      await db.execute("BEGIN TRANSACTION");
      await db.execute(
        `INSERT INTO notes 
        (id, workspaceId, folderId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          note.id,
          note.workspaceId,
          note.folderId || null,
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
      await db.execute("COMMIT");
    } catch (err) {
      console.error("SQLiteNoteRepository createNote error:", err);
      try {
        await db.execute("ROLLBACK");
      } catch {}
      throw err;
    }

    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const db = await this.getDb();
    const now = Date.now();

    if (updates.content !== undefined) {
      const existing = await this.getNoteById(id);
      if (!existing) throw new Error("Note not found");
      const updated: Note = { ...existing, ...updates, updatedAt: now };
      const encryptedContent = await EncryptionService.encryptPayload(updated.content);

      try {
        await db.execute("BEGIN TRANSACTION");
        await db.execute(
          "UPDATE notes SET workspaceId = ?, folderId = ?, title = ?, content = ?, icon = ?, coverColor = ?, isPinned = ?, isFavorite = ?, updatedAt = ? WHERE id = ?",
          [
            updated.workspaceId,
            updated.folderId || null,
            updated.title,
            encryptedContent,
            updated.icon || null,
            updated.coverColor || null,
            updated.isPinned ? 1 : 0,
            updated.isFavorite ? 1 : 0,
            updated.updatedAt,
            id,
          ],
        );
        await db.execute("COMMIT");
        return updated;
      } catch (err) {
        console.error("SQLiteNoteRepository updateNote with content error:", err);
        try {
          await db.execute("ROLLBACK");
        } catch {}
        throw err;
      }
    }

    try {
      await db.execute("BEGIN TRANSACTION");
      const setClauses: string[] = [];
      const params: unknown[] = [];

      if (updates.title !== undefined) {
        setClauses.push("title = ?");
        params.push(updates.title);
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
      if (updates.workspaceId !== undefined) {
        setClauses.push("workspaceId = ?");
        params.push(updates.workspaceId);
      }

      setClauses.push("updatedAt = ?");
      params.push(now);
      params.push(id);

      await db.execute(`UPDATE notes SET ${setClauses.join(", ")} WHERE id = ?`, params);
      await db.execute("COMMIT");

      const existing = await this.getNoteById(id);
      return (
        existing || {
          id,
          workspaceId: "",
          title: "",
          content: "",
          isPinned: false,
          isFavorite: false,
          createdAt: now,
          updatedAt: now,
        }
      );
    } catch (err) {
      console.error("SQLiteNoteRepository updateNote metadata error:", err);
      try {
        await db.execute("ROLLBACK");
      } catch {}
      throw err;
    }
  }

  async deleteNote(id: string): Promise<void> {
    const db = await this.getDb();
    try {
      await db.execute("BEGIN TRANSACTION");
      await db.execute("DELETE FROM notes WHERE id = ?", [id]);
      await db.execute("COMMIT");
    } catch (err) {
      console.error("SQLiteNoteRepository deleteNote error:", err);
      try {
        await db.execute("ROLLBACK");
      } catch {}
      throw err;
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
