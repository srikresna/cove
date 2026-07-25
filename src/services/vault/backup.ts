import { save } from "@tauri-apps/plugin-dialog";
import { SQLiteDatabase } from "../../repositories/SQLiteDatabase";

/**
 * Export an encrypted backup of the vault database.
 * Uses SQLite VACUUM INTO to create a clean, consistent copy at a user-chosen path.
 * The backup contains all encrypted notes + the kms record (wrapped DEK). The user's
 * passphrase is required to unlock the backup on any device.
 */
export async function exportBackup(): Promise<string | null> {
  const path = await save({
    defaultPath: "cove-backup.db",
    filters: [{ name: "SQLite Database", extensions: ["db"] }],
  });
  if (!path) return null; // user cancelled

  const db = await SQLiteDatabase.getInstance();
  // VACUUM INTO doesn't accept bound params; escape single quotes in the path.
  const escaped = path.replace(/'/g, "''");
  await db.execute(`VACUUM INTO '${escaped}'`);
  return path;
}
