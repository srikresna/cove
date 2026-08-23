import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { generateKeyBetween } from "fractional-indexing";
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

    if (version < 14) {
      const propCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(property_defs)");
      if (propCols.length > 0) {
        const statements: SqlStatement[] = [];
        if (!propCols.some((c) => c.name === "orderIndex")) {
          statements.push({
            sql: "ALTER TABLE property_defs ADD COLUMN orderIndex TEXT NOT NULL DEFAULT ''",
          });
        }
        if (!propCols.some((c) => c.name === "show")) {
          statements.push({
            sql: "ALTER TABLE property_defs ADD COLUMN show TEXT NOT NULL DEFAULT 'always-show'",
          });
        }
        // Recompute every key from creation order (not only unbackfilled rows):
        // the whole step is data-idempotent, so a database left half-migrated
        // by an interrupted earlier attempt heals on the next run.
        const rows = await db.select<Array<{ id: string }>>(
          "SELECT id FROM property_defs ORDER BY createdAt, id",
        );
        let prev: string | null = null;
        for (const row of rows) {
          const key = generateKeyBetween(prev, null);
          statements.push({
            sql: "UPDATE property_defs SET orderIndex = ? WHERE id = ?",
            params: [key, row.id],
          });
          prev = key;
        }
        statements.push({ sql: "PRAGMA user_version = 14" });
        // Atomic: ALTERs + backfill + version bump land together or not at all.
        await SQLiteDatabase.runTransaction(statements);
      } else {
        await db.execute("PRAGMA user_version = 14");
      }
    }

    if (version < 15) {
      const propCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(property_defs)");
      if (propCols.length > 0) {
        // Built-in Info rows become system property definitions: orderable and
        // hideable like any other row, but rename/delete are guarded in the
        // service layer and their values stay derived (tags service, note fields).
        const seed = [
          ["system:tags", "Tags", "tags"],
          ["system:workspace", "Workspace", "workspace"],
          ["system:created", "Created", "created"],
          ["system:updated", "Updated", "updated"],
        ] as const;
        const statements: SqlStatement[] = [
          // A v14 user could legally have created a custom property named
          // "Tags" etc.; keep the name-uniqueness invariant intact.
          {
            sql: "UPDATE property_defs SET name = name || ' (custom)' WHERE id NOT LIKE 'system:%' AND lower(name) IN ('tags','workspace','created','updated')",
          },
          ...seed.map(([id, name, type]) => ({
            sql: "INSERT OR IGNORE INTO property_defs (id, name, type, optionsJson, createdAt, orderIndex, show) VALUES (?, ?, ?, '[]', 0, '', 'always-show')",
            params: [id, name, type],
          })),
        ];
        // Build the full ordering in code: the seed rows above are only queued
        // for the transaction, so a SELECT could never see them yet. Custom rows
        // are ordered by their existing orderIndex to preserve any drag
        // arrangement made on v14 (createdAt is only a tiebreaker).
        const customRows = await db.select<Array<{ id: string }>>(
          "SELECT id FROM property_defs WHERE id NOT LIKE 'system:%' ORDER BY orderIndex, createdAt, id",
        );
        const orderedIds = [...seed.map(([id]) => id), ...customRows.map((row) => row.id)];
        let prev: string | null = null;
        for (const id of orderedIds) {
          const key = generateKeyBetween(prev, null);
          statements.push({
            sql: "UPDATE property_defs SET orderIndex = ? WHERE id = ?",
            params: [key, id],
          });
          prev = key;
        }
        statements.push({ sql: "PRAGMA user_version = 15" });
        await SQLiteDatabase.runTransaction(statements);
      } else {
        await db.execute("PRAGMA user_version = 15");
      }
    }

    if (version < 16) {
      const propCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(property_defs)");
      if (propCols.length > 0) {
        // Seed the journal row after the derived system rows: it is a date
        // property whose value lives in note_properties (local-midnight
        // timestamp), seeded hidden-until-set so only journal notes show it.
        //
        // Rows are fully re-keyed in code (v15 pattern): an interim build of
        // v15 seeded system rows with orderIndex '' and never backfilled them,
        // and fractional-indexing throws on empty keys - generateKeyBetween
        // (null, '') wedged every later launch inside migrate(). Recomputing
        // all keys here heals such databases and is a no-op rearrangement for
        // healthy ones, preserving each row's current relative order ('' rows
        // sort first under BINARY collation, so they heal at the head).
        const existing = await db.select<Array<{ id: string }>>(
          "SELECT id FROM property_defs ORDER BY (CASE WHEN orderIndex = '' THEN 0 ELSE 1 END), orderIndex, createdAt, id",
        );
        const orderedIds = existing.map((row) => row.id);
        let journalInsert: SqlStatement | null = null;
        if (!orderedIds.includes("system:journal")) {
          const updatedPos = orderedIds.indexOf("system:updated");
          orderedIds.splice(
            updatedPos >= 0 ? updatedPos + 1 : orderedIds.length,
            0,
            "system:journal",
          );
          journalInsert = {
            sql: "INSERT OR IGNORE INTO property_defs (id, name, type, optionsJson, createdAt, orderIndex, show) VALUES ('system:journal', 'Journal', 'date', '[]', 0, '', 'hide-when-empty')",
          };
        }
        const statements: SqlStatement[] = [
          {
            sql: "UPDATE property_defs SET name = name || ' (custom)' WHERE id NOT LIKE 'system:%' AND lower(name) = 'journal'",
          },
          ...(journalInsert ? [journalInsert] : []),
        ];
        let prev: string | null = null;
        for (const id of orderedIds) {
          const key = generateKeyBetween(prev, null);
          statements.push({
            sql: "UPDATE property_defs SET orderIndex = ? WHERE id = ?",
            params: [key, id],
          });
          prev = key;
        }
        statements.push({ sql: "PRAGMA user_version = 16" });
        await SQLiteDatabase.runTransaction(statements);
      } else {
        await db.execute("PRAGMA user_version = 16");
      }
    }

    if (version < 17) {
      const propCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(property_defs)");
      if (propCols.length > 0 && !propCols.some((c) => c.name === "icon")) {
        await db.execute("ALTER TABLE property_defs ADD COLUMN icon TEXT");
      }
      await db.execute("PRAGMA user_version = 17");
    }

    if (version < 18) {
      // Per-doc behaviors live on the notes row (like AFFI NE's dedicated
      // docProperties columns): edgeless theme, page width, template flag.
      const noteCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(notes)");
      const statements: SqlStatement[] = [];
      if (noteCols.length > 0) {
        if (!noteCols.some((c) => c.name === "edgelessTheme")) {
          statements.push({ sql: "ALTER TABLE notes ADD COLUMN edgelessTheme TEXT" });
        }
        if (!noteCols.some((c) => c.name === "pageWidth")) {
          statements.push({ sql: "ALTER TABLE notes ADD COLUMN pageWidth TEXT" });
        }
        if (!noteCols.some((c) => c.name === "isTemplate")) {
          statements.push({
            sql: "ALTER TABLE notes ADD COLUMN isTemplate INTEGER NOT NULL DEFAULT 0",
          });
        }
      }
      statements.push({ sql: "PRAGMA user_version = 18" });
      await SQLiteDatabase.runTransaction(statements);
    }

    if (version < 19) {
      const propCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(property_defs)");
      if (propCols.length > 0) {
        // Seed the four behavior rows after system:journal (v16 re-key
        // pattern: name-collision guard, full recompute with the seeds
        // placed right after the journal row).
        const seed = [
          ["system:doc-mode", "Doc mode", "always-show"],
          ["system:page-width", "Page width", "always-show"],
          ["system:edgeless-theme", "Edgeless theme", "hide-when-empty"],
          ["system:template", "Template", "hide-when-empty"],
        ] as const;
        const existing = await db.select<Array<{ id: string }>>(
          "SELECT id FROM property_defs ORDER BY (CASE WHEN orderIndex = '' THEN 0 ELSE 1 END), orderIndex, createdAt, id",
        );
        const orderedIds = existing.map((row) => row.id);
        let insertAfter = orderedIds.indexOf("system:journal");
        if (insertAfter === -1) insertAfter = orderedIds.length - 1;
        for (const [seedId] of seed) {
          if (!orderedIds.includes(seedId)) {
            orderedIds.splice(insertAfter + 1, 0, seedId);
            insertAfter += 1;
          }
        }
        const statements: SqlStatement[] = [
          {
            sql: "UPDATE property_defs SET name = name || ' (custom)' WHERE id NOT LIKE 'system:%' AND lower(name) IN ('doc mode','page width','edgeless theme','template')",
          },
          ...seed.map(([id, name, show]) => ({
            sql: "INSERT OR IGNORE INTO property_defs (id, name, type, optionsJson, createdAt, orderIndex, show) VALUES (?, ?, 'text', '[]', 0, '', ?)",
            params: [id, name, show],
          })),
        ];
        let prev: string | null = null;
        for (const id of orderedIds) {
          const key = generateKeyBetween(prev, null);
          statements.push({
            sql: "UPDATE property_defs SET orderIndex = ? WHERE id = ?",
            params: [key, id],
          });
          prev = key;
        }
        statements.push({ sql: "PRAGMA user_version = 19" });
        await SQLiteDatabase.runTransaction(statements);
      } else {
        await db.execute("PRAGMA user_version = 19");
      }
    }

    if (version < 20) {
      // Tags become workspace-scoped: the tags table is rebuilt with a
      // workspaceId column and a per-workspace name unique constraint
      // (replacing the global one). Tags used in several workspaces are
      // duplicated per workspace and their note_tags rows remapped; orphan
      // tags land in the first workspace.
      const tagCols = await db.select<Array<{ name: string }>>("PRAGMA table_info(tags)");
      if (tagCols.length > 0 && !tagCols.some((c) => c.name === "workspaceId")) {
        const workspaces = await db.select<Array<{ id: string }>>(
          "SELECT id FROM workspaces ORDER BY createdAt, id",
        );
        const fallbackWs = workspaces[0]?.id ?? "__local__";
        const oldTags = await db.select<
          Array<{ id: string; name: string; color: string; createdAt: number }>
        >("SELECT id, name, color, createdAt FROM tags");
        const statements: SqlStatement[] = [
          {
            sql: "CREATE TABLE tags_v20 (id TEXT PRIMARY KEY, workspaceId TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL, createdAt INTEGER NOT NULL, UNIQUE(workspaceId, name))",
          },
          {
            sql: "CREATE TABLE note_tags_v20 (noteId TEXT NOT NULL, tagId TEXT NOT NULL, PRIMARY KEY (noteId, tagId), FOREIGN KEY (noteId) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE)",
          },
        ];
        const duplicates: Array<{ oldId: string; newId: string; workspaceId: string }> = [];
        for (const tag of oldTags) {
          const wsRows = await db.select<Array<{ workspaceId: string }>>(
            "SELECT DISTINCT n.workspaceId FROM note_tags nt JOIN notes n ON n.id = nt.noteId WHERE nt.tagId = ?",
            [tag.id],
          );
          const wsIds = wsRows.map((r) => r.workspaceId);
          if (wsIds.length === 0) wsIds.push(fallbackWs);
          statements.push({
            sql: "INSERT INTO tags_v20 (id, workspaceId, name, color, createdAt) VALUES (?, ?, ?, ?, ?)",
            params: [tag.id, wsIds[0], tag.name, tag.color, tag.createdAt],
          });
          for (const ws of wsIds.slice(1)) {
            const newId = crypto.randomUUID();
            duplicates.push({ oldId: tag.id, newId, workspaceId: ws });
            statements.push({
              sql: "INSERT INTO tags_v20 (id, workspaceId, name, color, createdAt) VALUES (?, ?, ?, ?, ?)",
              params: [newId, ws, tag.name, tag.color, tag.createdAt],
            });
          }
        }
        statements.push({
          sql: "INSERT INTO note_tags_v20 (noteId, tagId) SELECT noteId, tagId FROM note_tags",
        });
        for (const dup of duplicates) {
          statements.push({
            sql: "UPDATE note_tags_v20 SET tagId = ? WHERE tagId = ? AND noteId IN (SELECT id FROM notes WHERE workspaceId = ?)",
            params: [dup.newId, dup.oldId, dup.workspaceId],
          });
        }
        statements.push(
          { sql: "DROP TABLE note_tags" },
          { sql: "DROP TABLE tags" },
          { sql: "ALTER TABLE tags_v20 RENAME TO tags" },
          { sql: "ALTER TABLE note_tags_v20 RENAME TO note_tags" },
          { sql: "PRAGMA user_version = 20" },
        );
        await SQLiteDatabase.runTransaction(statements);
      } else {
        await db.execute("PRAGMA user_version = 20");
      }
    }
  }
}
