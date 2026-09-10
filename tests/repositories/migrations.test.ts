import { createRequire } from "node:module";
import type { DatabaseSync as DatabaseSyncType, SQLInputValue } from "node:sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));
vi.mock("@tauri-apps/plugin-sql", () => ({ default: class {} }));

const nodeRequire = createRequire(import.meta.url);

import { type MigrationDb, runMigrations, type SqlStatement } from "@/repositories/SQLiteDatabase";

function loadNodeSqlite(): typeof import("node:sqlite") {
  return nodeRequire("node:sqlite");
}

function makeDb(raw: DatabaseSyncType): MigrationDb {
  raw.exec("PRAGMA foreign_keys = ON");
  return {
    execute: async (sql, params) => raw.prepare(sql).run(...((params ?? []) as SQLInputValue[])),
    select: async <T>(sql: string, params?: unknown[]) =>
      raw.prepare(sql).all(...((params ?? []) as SQLInputValue[])) as T,
    runTransaction: async (statements: SqlStatement[]) => {
      raw.exec("BEGIN");
      try {
        for (const s of statements)
          raw.prepare(s.sql).run(...((s.params ?? []) as SQLInputValue[]));
        raw.exec("COMMIT");
      } catch (err) {
        raw.exec("ROLLBACK");
        throw err;
      }
    },
  };
}

const userVersion = async (db: MigrationDb): Promise<number> =>
  (await db.select<Array<{ user_version: number }>>("PRAGMA user_version"))[0]?.user_version ?? 0;

const columnsOf = async (db: MigrationDb, table: string): Promise<string[]> =>
  (await db.select<Array<{ name: string }>>(`PRAGMA table_info(${table})`)).map((c) => c.name);

const NOTE_COLUMNS = [
  "id",
  "workspaceId",
  "title",
  "titleKmsVersion",
  "content",
  "icon",
  "coverColor",
  "docMode",
  "edgelessTheme",
  "pageWidth",
  "isTemplate",
  "isPinned",
  "isFavorite",
  "orderIndex",
  "kmsVersion",
  "deletedAt",
  "createdAt",
  "updatedAt",
];

describe("migration ladder", () => {
  let db: MigrationDb;
  beforeEach(() => {
    const { DatabaseSync } = loadNodeSqlite();
    const raw = new DatabaseSync(":memory:");
    db = makeDb(raw);
  });

  it("brings a fresh database to the current version with the full schema", async () => {
    await runMigrations(db);
    expect(await userVersion(db)).toBe(27);

    const noteCols = await columnsOf(db, "notes");
    for (const col of NOTE_COLUMNS) expect(noteCols).toContain(col);

    const viewCols = await columnsOf(db, "saved_views");
    expect(viewCols).toContain("allowNoteIdsJson");
    const defCols = await columnsOf(db, "property_defs");
    for (const col of ["orderIndex", "show", "icon"]) expect(defCols).toContain(col);
    for (const table of [
      "tags",
      "note_tags",
      "note_properties",
      "kms",
      "note_covers",
      "workspace_icons",
      "custom_icons",
    ]) {
      const cols = await columnsOf(db, table);
      expect(cols.length, `table ${table} columns`).toBeGreaterThan(0);
    }
  });

  it("is idempotent — re-running against the current version changes nothing", async () => {
    await runMigrations(db);
    await runMigrations(db);
    expect(await userVersion(db)).toBe(27);
  });

  it("v27 drops the journal property def, its values, and journal view rules", async () => {
    await runMigrations(db);
    await db.execute(
      "INSERT INTO workspaces (id, name, emoji, color, createdAt) VALUES ('w1', 'W', '📝', '#111', 1)",
    );
    await db.execute(
      "INSERT INTO notes (id, workspaceId, title, content, createdAt, updatedAt, orderIndex) VALUES ('n1', 'w1', 'J', '', 1, 1, '')",
    );
    await db.execute(
      "INSERT INTO property_defs (id, name, type, optionsJson, createdAt, orderIndex, show) VALUES ('system:journal', 'Journal', 'date', '[]', 0, '', 'hide-when-empty')",
    );
    await db.execute(
      "INSERT INTO note_properties (noteId, propertyId, valueJson) VALUES ('n1', 'system:journal', '{\"type\":\"date\",\"timestamp\":1}')",
    );
    await db.execute(
      'INSERT INTO saved_views (id, workspaceId, name, rulesJson, createdAt) VALUES (\'v1\', \'w1\', \'Journals\', \'[{"kind":"journal","op":"is"},{"kind":"tag","op":"is","tagId":"t1"}]\', 1)',
    );
    await db.execute(
      "INSERT INTO saved_views (id, workspaceId, name, rulesJson, createdAt) VALUES ('v2', 'w1', 'Journal only', '[{\"kind\":\"journal\",\"op\":\"is\"}]', 2)",
    );
    await db.execute("PRAGMA user_version = 26");

    await runMigrations(db);

    const defs = await db.select<Array<{ id: string }>>(
      "SELECT id FROM property_defs WHERE id = 'system:journal'",
    );
    expect(defs).toHaveLength(0);
    const values = await db.select<Array<{ noteId: string }>>(
      "SELECT noteId FROM note_properties WHERE propertyId = 'system:journal'",
    );
    expect(values).toHaveLength(0);
    const views = await db.select<Array<{ rulesJson: string }>>(
      "SELECT rulesJson FROM saved_views WHERE id = 'v1'",
    );
    expect(JSON.parse(views[0]?.rulesJson ?? "[]")).toEqual([
      { kind: "tag", op: "is", tagId: "t1" },
    ]);
    const journalOnly = await db.select<Array<{ id: string }>>(
      "SELECT id FROM saved_views WHERE id = 'v2'",
    );
    expect(journalOnly).toHaveLength(0);
  });

  it("seeds unique ascending orderIndex keys for unkeyed rows (v23)", async () => {
    await runMigrations(db);
    await db.execute(
      "INSERT INTO workspaces (id, name, emoji, color, createdAt) VALUES ('w1', 'W', '📝', '#111', 1)",
    );
    for (let i = 0; i < 3; i += 1) {
      await db.execute(
        "INSERT INTO notes (id, workspaceId, title, content, createdAt, updatedAt, orderIndex) VALUES (?, 'w1', ?, '', ?, ?, '')",
        [`n${i}`, `N${i}`, 100 - i, 100 - i],
      );
    }
    await db.execute("PRAGMA user_version = 22");
    await runMigrations(db);

    const keys = (
      await db.select<Array<{ id: string; orderIndex: string }>>(
        "SELECT id, orderIndex FROM notes ORDER BY createdAt",
      )
    ).map((r) => r.orderIndex);
    expect(keys.every((k) => k !== "")).toBe(true);
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual(keys);
  });

  it("a failed transaction rolls back every statement (atomicity seam)", async () => {
    await runMigrations(db);
    await expect(
      db.runTransaction([
        {
          sql: "INSERT INTO workspaces (id, name, emoji, color, createdAt) VALUES ('w1', 'W', '📝', '#111', 1)",
        },
        { sql: "INSERT INTO no_such_table VALUES (1)" },
      ]),
    ).rejects.toThrow();
    const rows = await db.select<Array<{ id: string }>>("SELECT id FROM workspaces");
    expect(rows).toHaveLength(0);
  });

  it("a mid-ladder failure leaves user_version at the prior version (crash recovery)", async () => {
    const failing: MigrationDb = {
      execute: db.execute,
      select: db.select,
      runTransaction: async (statements) => {
        if (statements.some((s) => s.sql.includes("PRAGMA user_version = 23"))) {
          throw new Error("simulated crash mid-v23");
        }
        await db.runTransaction(statements);
      },
    };
    await expect(runMigrations(failing)).rejects.toThrow("simulated crash mid-v23");
    expect(await userVersion(db)).toBe(22);
  });

  it("respects foreign-key cascades through the seam", async () => {
    await runMigrations(db);
    await db.execute(
      "INSERT INTO workspaces (id, name, emoji, color, createdAt) VALUES ('w1', 'W', '📝', '#111', 1)",
    );
    await db.execute(
      "INSERT INTO notes (id, workspaceId, title, content, createdAt, updatedAt) VALUES ('n1', 'w1', 'T', '', 1, 1)",
    );
    await db.execute("DELETE FROM workspaces WHERE id = 'w1'");
    const notes = await db.select<Array<{ id: string }>>("SELECT id FROM notes");
    expect(notes).toHaveLength(0);
  });
});
