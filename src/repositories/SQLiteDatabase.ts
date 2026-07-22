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
        return db;
      })();
    }
    return SQLiteDatabase.instance;
  }
}
