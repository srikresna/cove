import Database from "@tauri-apps/plugin-sql";

export class SQLiteDatabase {
  private static instance: Promise<Database> | null = null;

  static getInstance(): Promise<Database> {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = (async () => {
        const db = await Database.load("sqlite:cove.db");
        await db.execute("PRAGMA journal_mode = WAL");
        await db.execute("PRAGMA synchronous = NORMAL");
        await db.execute("PRAGMA foreign_keys = ON");
        await db.execute("PRAGMA temp_store = MEMORY");
        await db.execute("PRAGMA cache_size = -20000");
        await db.execute("PRAGMA mmap_size = 268435456");
        await db.execute("PRAGMA wal_autocheckpoint = 1000");
        return db;
      })();
    }
    return SQLiteDatabase.instance;
  }

  static async withTransaction<T>(work: (db: Database) => Promise<T>): Promise<T> {
    const db = await SQLiteDatabase.getInstance();
    await db.execute("BEGIN TRANSACTION");
    try {
      const result = await work(db);
      await db.execute("COMMIT");
      return result;
    } catch (err) {
      try {
        await db.execute("ROLLBACK");
      } catch {}
      throw err;
    }
  }
}
