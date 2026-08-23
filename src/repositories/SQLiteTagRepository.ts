import type { Tag } from "../domain/tag/Tag";
import { toPersistenceError } from "../errors/errorMappers";
import type { ITagRepository, TagCount } from "./ITagRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

function rowToTag(row: Record<string, unknown>): Tag {
  return {
    id: String(row.id),
    workspaceId: String(row.workspaceId),
    name: String(row.name),
    color: String(row.color),
    createdAt: Number(row.createdAt),
  };
}

export class SQLiteTagRepository implements ITagRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async listByWorkspace(workspaceId: string): Promise<Tag[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, name, color, createdAt FROM tags WHERE workspaceId = ? ORDER BY name COLLATE NOCASE",
        [workspaceId],
      );
      return rows.map(rowToTag);
    } catch (err) {
      throw toPersistenceError("tags.listByWorkspace", err);
    }
  }

  async countsByWorkspace(workspaceId: string): Promise<TagCount[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ tagId: string; noteCount: number }>>(
        `SELECT t.id as tagId, COUNT(nt.noteId) as noteCount
         FROM tags t LEFT JOIN note_tags nt ON nt.tagId = t.id
         WHERE t.workspaceId = ?
         GROUP BY t.id`,
        [workspaceId],
      );
      return rows.map((r) => ({ tagId: String(r.tagId), noteCount: Number(r.noteCount) }));
    } catch (err) {
      throw toPersistenceError("tags.countsByWorkspace", err);
    }
  }

  async findById(tagId: string): Promise<Tag | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, name, color, createdAt FROM tags WHERE id = ?",
        [tagId],
      );
      const row = rows[0];
      return row ? rowToTag(row) : null;
    } catch (err) {
      throw toPersistenceError("tags.findById", err);
    }
  }

  async findByName(workspaceId: string, name: string): Promise<Tag | null> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT id, workspaceId, name, color, createdAt FROM tags WHERE workspaceId = ? AND name = ? COLLATE NOCASE",
        [workspaceId, name],
      );
      const row = rows[0];
      return row ? rowToTag(row) : null;
    } catch (err) {
      throw toPersistenceError("tags.findByName", err);
    }
  }

  async create(tag: Tag): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute(
        "INSERT INTO tags (id, workspaceId, name, color, createdAt) VALUES (?, ?, ?, ?, ?)",
        [tag.id, tag.workspaceId, tag.name, tag.color, tag.createdAt],
      );
    } catch (err) {
      throw toPersistenceError("tags.create", err);
    }
  }

  async update(tagId: string, patch: { name?: string; color?: string }): Promise<void> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (patch.name !== undefined) {
      sets.push("name = ?");
      params.push(patch.name);
    }
    if (patch.color !== undefined) {
      sets.push("color = ?");
      params.push(patch.color);
    }
    if (sets.length === 0) return;
    try {
      const db = await this.getDb();
      await db.execute(`UPDATE tags SET ${sets.join(", ")} WHERE id = ?`, [...params, tagId]);
    } catch (err) {
      throw toPersistenceError("tags.update", err);
    }
  }

  async delete(tagId: string): Promise<void> {
    try {
      await SQLiteDatabase.runTransaction([
        { sql: "DELETE FROM note_tags WHERE tagId = ?", params: [tagId] },
        { sql: "DELETE FROM tags WHERE id = ?", params: [tagId] },
      ]);
    } catch (err) {
      throw toPersistenceError("tags.delete", err);
    }
  }

  async countInWorkspace(workspaceId: string): Promise<number> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ c: number }>>(
        "SELECT COUNT(*) as c FROM tags WHERE workspaceId = ?",
        [workspaceId],
      );
      return rows[0]?.c ?? 0;
    } catch (err) {
      throw toPersistenceError("tags.countInWorkspace", err);
    }
  }

  async tagsForNote(noteId: string): Promise<Tag[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<Record<string, unknown>>>(
        "SELECT t.id, t.workspaceId, t.name, t.color, t.createdAt FROM tags t JOIN note_tags nt ON nt.tagId = t.id WHERE nt.noteId = ? ORDER BY t.name COLLATE NOCASE",
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
