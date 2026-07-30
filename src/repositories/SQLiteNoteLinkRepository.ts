import { toPersistenceError } from "../errors/errorMappers";
import type { INoteLinkRepository } from "./INoteLinkRepository";
import type { SqlStatement } from "./SQLiteDatabase";
import { SQLiteDatabase } from "./SQLiteDatabase";

export class SQLiteNoteLinkRepository implements INoteLinkRepository {
  private getDb() {
    return SQLiteDatabase.getInstance();
  }

  async replaceForSource(sourceId: string, targetIds: string[]): Promise<void> {
    const targets = [...new Set(targetIds)].filter((id) => id && id !== sourceId);
    // DELETE + all INSERTs run as one transaction so a failure can never leave the
    // note with zero or partial links.
    const statements: SqlStatement[] = [
      { sql: "DELETE FROM note_links WHERE sourceId = ?", params: [sourceId] },
      ...targets.map((targetId) => ({
        // OR IGNORE: the target may have been deleted since the link was typed.
        sql: "INSERT OR IGNORE INTO note_links (sourceId, targetId) SELECT ?, id FROM notes WHERE id = ?",
        params: [sourceId, targetId],
      })),
    ];
    try {
      await SQLiteDatabase.runTransaction(statements);
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
