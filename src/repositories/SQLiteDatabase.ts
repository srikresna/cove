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
   * NOTE: the v2 recreate-table uses a raw BEGIN/COMMIT inline (NOT a helper) because
   * tauri-plugin-sql's sqlx pool may route each execute to a different connection,
   * breaking multi-call transactions. Single-statement autocommit is always safe.
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

    if (version < 3) {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS kms (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          kdfVersion INTEGER NOT NULL,
          kdfAlg TEXT NOT NULL,
          kdfParamsJson TEXT NOT NULL,
          saltB64 TEXT NOT NULL,
          ivCounter INTEGER NOT NULL DEFAULT 0,
          wrappedDekLocalB64 TEXT,
          integrityMacB64 TEXT NOT NULL,
          migrationState TEXT NOT NULL DEFAULT 'complete',
          migrationCursor TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        )
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS migration_failures (
          id TEXT PRIMARY KEY,
          reason TEXT,
          at INTEGER NOT NULL
        )
      `);
      const noteCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
      if (!noteCols.some((c) => c.name === "kmsVersion")) {
        await db.execute("ALTER TABLE notes ADD COLUMN kmsVersion INTEGER NOT NULL DEFAULT 0");
      }
      await db.execute("PRAGMA user_version = 3");
    }

    if (version < 4) {
      // FTS5 title index — fast SQL-level title search without decrypting content.
      // Graceful degradation: if FTS5 is not compiled into the bundled SQLite,
      // the catch silently skips it and search falls back to decrypt-on-search.
      try {
        await db.execute(
          "CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(note_id UNINDEXED, title, tokenize='unicode61 remove_diacritics 2')",
        );
        await db.execute(
          "CREATE TRIGGER IF NOT EXISTS notes_fts_ai AFTER INSERT ON notes BEGIN INSERT INTO notes_fts(note_id, title) VALUES (new.id, new.title); END",
        );
        await db.execute(
          "CREATE TRIGGER IF NOT EXISTS notes_fts_ad AFTER DELETE ON notes BEGIN DELETE FROM notes_fts WHERE note_id = old.id; END",
        );
        await db.execute(
          "CREATE TRIGGER IF NOT EXISTS notes_fts_au AFTER UPDATE OF title ON notes BEGIN UPDATE notes_fts SET title = new.title WHERE note_id = new.id; END",
        );
        await db.execute(
          "INSERT INTO notes_fts(note_id, title) SELECT id, title FROM notes WHERE id NOT IN (SELECT note_id FROM notes_fts)",
        );
      } catch {
        // FTS5 not available — search will use decrypt-on-search only.
      }
      await db.execute("PRAGMA user_version = 4");
    }
  }
}
