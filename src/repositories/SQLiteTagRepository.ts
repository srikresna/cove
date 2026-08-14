import { makeTagId, type Tag } from "../domain/tag/Tag";
import { PersistenceError } from "../errors/AppError";
import { toPersistenceError } from "../errors/errorMappers";
import type { ITagRepository } from "./ITagRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

function rowToTag(row: Record<string, unknown>): Tag {
  return {
    id: String(row.id),
    name: String(row.name),
    color: String(row.color),
    createdAt: Number(row.createdAt),
  };
}

export class SQLiteTagRepository implements ITagRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async listAll(): Promise<Tag[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, name, color, createdAt FROM tags ORDER BY name COLLATE NOCASE",
      );
      return rows.map(rowToTag);
    } catch (err) {
      throw toPersistenceError("tags.listAll", err);
    }
  }

  async findByName(name: string): Promise<Tag | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, name, color, createdAt FROM tags WHERE name = ? COLLATE NOCASE",
        [name],
      );
      return rows[0] ? rowToTag(rows[0]) : null;
    } catch (err) {
      throw toPersistenceError("tags.findByName", err);
    }
  }

  async findOrCreateByName(name: string, color: string): Promise<Tag> {
    try {
      const db = await this.getDb();

      await db.execute(
        "INSERT OR IGNORE INTO tags (id, name, color, createdAt) VALUES (?, ?, ?, ?)",
        [makeTagId(), name, color, Date.now()],
      );
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, name, color, createdAt FROM tags WHERE name = ? COLLATE NOCASE",
        [name],
      );
      const row = rows[0];
      if (!row) {
        throw new PersistenceError("tags.findOrCreateByName", "tag missing after upsert");
      }
      return rowToTag(row);
    } catch (err) {
      throw toPersistenceError("tags.findOrCreateByName", err);
    }
  }

  async create(tag: Tag): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("INSERT INTO tags (id, name, color, createdAt) VALUES (?, ?, ?, ?)", [
        tag.id,
        tag.name,
        tag.color,
        tag.createdAt,
      ]);
    } catch (err) {
      throw toPersistenceError("tags.create", err);
    }
  }

  async count(): Promise<number> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ c: number }>>("SELECT COUNT(*) as c FROM tags");
      return rows[0]?.c ?? 0;
    } catch (err) {
      throw toPersistenceError("tags.count", err);
    }
  }

  async tagsForNote(noteId: string): Promise<Tag[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT t.id, t.name, t.color, t.createdAt FROM tags t JOIN note_tags nt ON nt.tagId = t.id WHERE nt.noteId = ? ORDER BY t.name COLLATE NOCASE",
        [noteId],
      );
      return rows.map(rowToTag);
    } catch (err) {
      throw toPersistenceError("tags.tagsForNote", err);
    }
  }

  async noteIdsForTag(tagId: string): Promise<string[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ noteId: string }>>(
        "SELECT noteId FROM note_tags WHERE tagId = ?",
        [tagId],
      );
      return rows.map((r) => String(r.noteId));
    } catch (err) {
      throw toPersistenceError("tags.noteIdsForTag", err);
    }
  }

  async addToNote(noteId: string, tagId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("INSERT OR IGNORE INTO note_tags (noteId, tagId) VALUES (?, ?)", [
        noteId,
        tagId,
      ]);
    } catch (err) {
      throw toPersistenceError("tags.addToNote", err);
    }
  }

  async removeFromNote(noteId: string, tagId: string): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM note_tags WHERE noteId = ? AND tagId = ?", [noteId, tagId]);
    } catch (err) {
      throw toPersistenceError("tags.removeFromNote", err);
    }
  }
}
