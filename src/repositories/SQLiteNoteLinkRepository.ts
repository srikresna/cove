import { toPersistenceError } from "../errors/errorMappers";
import type { INoteLinkRepository } from "./INoteLinkRepository";
import { SQLiteDatabase } from "./SQLiteDatabase";

export class SQLiteNoteLinkRepository implements INoteLinkRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async replaceForSource(sourceId: string, targetIds: string[]): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute("DELETE FROM note_links WHERE sourceId = ?", [sourceId]);
      const targets = [...new Set(targetIds)].filter((id) => id && id !== sourceId);
      for (const targetId of targets) {
        // OR IGNORE: the target may have been deleted since the link was typed.
        await db.execute(
          "INSERT OR IGNORE INTO note_links (sourceId, targetId) SELECT ?, id FROM notes WHERE id = ?",
          [sourceId, targetId],
        );
      }
    } catch (err) {
      throw toPersistenceError("links.replaceForSource", err);
    }
  }

  async backlinksOf(targetId: string): Promise<string[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<Array<{ sourceId: string }>>(
        "SELECT sourceId FROM note_links WHERE targetId = ? ORDER BY sourceId",
        [targetId],
      );
      return rows.map((r) => String(r.sourceId));
    } catch (err) {
      throw toPersistenceError("links.backlinksOf", err);
    }
  }
}
