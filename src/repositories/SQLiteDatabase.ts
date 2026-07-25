import Database from "@tauri-apps/plugin-sql";

export class SQLiteDatabase {
  private static instance: Promise<Database> | null = null;

  /**
   * Returns a DB handle that is guaranteed to have its schema fully migrated.
   * The connection + PRAGMAs + schema migration all resolve inside this promise,
   * so any `await this.getDb()` caller cannot race ahead of `CREATE TABLE`.
   */
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
        await SQLiteDatabase.migrate(db);
        return db;
      })();
    }
    return SQLiteDatabase.instance;
  }

  /**
   * Single owner of schema + versioned migrations (PRAGMA user_version ladder).
   * v1: base schema (workspaces, notes, index). v2: drop legacy `folderId` column.
   * Runs a raw BEGIN/COMMIT (not withTransaction) because withTransaction re-enters
   * getInstance(), which is mid-resolution while migrate() runs.
   */
  private static async migrate(db: Database): Promise<void> {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        emoji TEXT NOT NULL,
        color TEXT NOT NULL,
        description TEXT,
        createdAt INTEGER NOT NULL
      )
    `);
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
    await db.execute(
      "CREATE INDEX IF NOT EXISTS idx_notes_workspace_updated ON notes(workspaceId, updatedAt DESC, id DESC)",
    );

    const versionRows = await db.select<Array<{ user_version: number }>>("PRAGMA user_version");
    const version = versionRows[0]?.user_version ?? 0;

    if (version < 2) {
      const cols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
      if (cols.some((c) => c.name === "folderId")) {
        await db.execute("BEGIN TRANSACTION");
        try {
          await db.execute(
            "CREATE TABLE notes_new (id TEXT PRIMARY KEY, workspaceId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, icon TEXT, coverColor TEXT, isPinned INTEGER NOT NULL DEFAULT 0, isFavorite INTEGER NOT NULL DEFAULT 0, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE)",
          );
          await db.execute(
            "INSERT INTO notes_new (id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt) SELECT id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt FROM notes",
          );
          await db.execute("DROP TABLE notes");
          await db.execute("ALTER TABLE notes_new RENAME TO notes");
          await db.execute(
            "CREATE INDEX IF NOT EXISTS idx_notes_workspace_updated ON notes(workspaceId, updatedAt DESC, id DESC)",
          );
          await db.execute("PRAGMA user_version = 2");
          await db.execute("COMMIT");
        } catch (err) {
          try {
            await db.execute("ROLLBACK");
          } catch {}
          throw err;
        }
      } else {
        await db.execute("PRAGMA user_version = 2");
      }
    }
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
