import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { PersistenceError } from "../errors/AppError";

export interface SqlStatement {
  sql: string;
  params?: unknown[];
}

export class SQLiteDatabase {
  private static instance: Promise<Database> | null = null;
  private static suspended = false;

  static getInstance(): Promise<Database> {
    if (SQLiteDatabase.suspended) {
      return Promise.reject(
        new PersistenceError("db.open", "Database is suspended while a backup is being restored."),
      );
    }
    if (!SQLiteDatabase.instance) {
      const init = (async () => {
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
      SQLiteDatabase.instance = init;
      init.catch(() => {
        if (SQLiteDatabase.instance === init) SQLiteDatabase.instance = null;
      });
    }
    return SQLiteDatabase.instance;
  }

  static async suspend(): Promise<void> {
    SQLiteDatabase.suspended = true;
    if (!SQLiteDatabase.instance) return;
    try {
      const db = await SQLiteDatabase.instance;
      await db.close();
    } finally {
      SQLiteDatabase.instance = null;
    }
  }

  static resume(): void {
    SQLiteDatabase.suspended = false;
  }

  static async runTransaction(statements: SqlStatement[]): Promise<void> {
    if (SQLiteDatabase.suspended) {
      throw new PersistenceError(
        "db.transaction",
        "Database is suspended while a backup is being restored.",
      );
    }
    await invoke("run_sql_transaction", { statements });
  }

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
        await SQLiteDatabase.runTransaction([
          {
            sql: "CREATE TABLE notes_new (id TEXT PRIMARY KEY, workspaceId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, icon TEXT, coverColor TEXT, isPinned INTEGER NOT NULL DEFAULT 0, isFavorite INTEGER NOT NULL DEFAULT 0, createdAt INTEGER NOT NULL, updatedAt INTEGER NOT NULL, FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE)",
          },
          {
            sql: "INSERT INTO notes_new (id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt) SELECT id, workspaceId, title, content, icon, coverColor, isPinned, isFavorite, createdAt, updatedAt FROM notes",
          },
          { sql: "DROP TABLE notes" },
          { sql: "ALTER TABLE notes_new RENAME TO notes" },
          {
            sql: "CREATE INDEX IF NOT EXISTS idx_notes_workspace_updated ON notes(workspaceId, updatedAt DESC, id DESC)",
          },
          { sql: "PRAGMA user_version = 2" },
        ]);
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
      } catch {}
      await db.execute("PRAGMA user_version = 4");
    }

    if (version < 5) {
      const kmsRows = await db.select<Array<{ migrationState: string }>>(
        "SELECT migrationState FROM kms WHERE id = 1",
      );
      if (kmsRows[0]?.migrationState === "complete") {
        await db.execute(
          "UPDATE notes SET kmsVersion = 1 WHERE kmsVersion = 0 AND id NOT IN (SELECT id FROM migration_failures)",
        );
      }
      await db.execute("PRAGMA user_version = 5");
    }

    if (version < 6) {
      await db.execute(
        "CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, color TEXT NOT NULL, createdAt INTEGER NOT NULL)",
      );
      await db.execute(
        "CREATE TABLE IF NOT EXISTS note_tags (noteId TEXT NOT NULL, tagId TEXT NOT NULL, PRIMARY KEY (noteId, tagId), FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE)",
      );
      await db.execute(
        "CREATE TABLE IF NOT EXISTS note_links (sourceId TEXT NOT NULL, targetId TEXT NOT NULL, PRIMARY KEY (sourceId, targetId), FOREIGN KEY (sourceId) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY (targetId) REFERENCES notes(id) ON DELETE CASCADE)",
      );
      await db.execute("CREATE INDEX IF NOT EXISTS idx_note_links_target ON note_links(targetId)");
      await db.execute("PRAGMA user_version = 6");
    }

    if (version < 7) {
      await db.execute(
        "CREATE TABLE IF NOT EXISTS note_covers (noteId TEXT PRIMARY KEY, payload TEXT NOT NULL, kmsVersion INTEGER NOT NULL DEFAULT 1, updatedAt INTEGER NOT NULL, FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE)",
      );
      await db.execute("PRAGMA user_version = 7");
    }

    if (version < 8) {
      const noteCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
      if (!noteCols.some((c) => c.name === "deletedAt")) {
        await db.execute("ALTER TABLE notes ADD COLUMN deletedAt INTEGER");
      }
      await db.execute("CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(deletedAt)");
      await db.execute("PRAGMA user_version = 8");
    }

    if (version < 9) {
      const noteCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
      if (!noteCols.some((c) => c.name === "docMode")) {
        await db.execute("ALTER TABLE notes ADD COLUMN docMode TEXT");
      }
      await db.execute("PRAGMA user_version = 9");
    }

    if (version < 10) {
      await db.execute(
        "CREATE TABLE IF NOT EXISTS property_defs (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, optionsJson TEXT NOT NULL DEFAULT '[]', createdAt INTEGER NOT NULL)",
      );
      await db.execute(
        "CREATE TABLE IF NOT EXISTS note_properties (noteId TEXT NOT NULL, propertyId TEXT NOT NULL, valueJson TEXT NOT NULL, PRIMARY KEY (noteId, propertyId), FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY (propertyId) REFERENCES property_defs(id) ON DELETE CASCADE)",
      );
      await db.execute("PRAGMA user_version = 10");
    }

    if (version < 11) {
      const noteCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
      if (!noteCols.some((c) => c.name === "titleKmsVersion")) {
        await db.execute("ALTER TABLE notes ADD COLUMN titleKmsVersion INTEGER NOT NULL DEFAULT 0");
      }
      await db.execute("DROP TRIGGER IF EXISTS notes_fts_ai");
      await db.execute("DROP TRIGGER IF EXISTS notes_fts_ad");
      await db.execute("DROP TRIGGER IF EXISTS notes_fts_au");
      await db.execute("DROP TABLE IF EXISTS notes_fts");
      await db.execute("PRAGMA user_version = 11");
    }

    if (version < 12) {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS note_blobs (
          id TEXT PRIMARY KEY,
          payload TEXT NOT NULL,
          kmsVersion INTEGER NOT NULL DEFAULT 1,
          updatedAt INTEGER NOT NULL
        )
      `);
      await db.execute("PRAGMA user_version = 12");
    }

    if (version < 13) {
      const tagCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(tags)");
      if (tagCols.length > 0) {
        await db.execute(
          `UPDATE note_tags SET tagId = COALESCE(
            (
              SELECT k.id FROM tags k
              WHERE LOWER(k.name) = (
                SELECT LOWER(d.name) FROM tags d WHERE d.id = note_tags.tagId
              )
              ORDER BY k.createdAt, k.id LIMIT 1
            ),
            note_tags.tagId
          )`,
        );
        await db.execute(
          `DELETE FROM tags WHERE id NOT IN (
            SELECT t.id FROM tags t
            WHERE t.id = (
              SELECT t2.id FROM tags t2
              WHERE LOWER(t2.name) = LOWER(t.name)
              ORDER BY t2.createdAt, t2.id LIMIT 1
            )
          )`,
        );
        await db.execute(
          "CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_nocase ON tags(name COLLATE NOCASE)",
        );
      }
      await db.execute("PRAGMA user_version = 13");
    }
  }
}
