import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

/**
 * Export an encrypted backup of the vault database.
 * Delegates to a Rust command (file copy) so the path never touches SQL
 * string interpolation — no injection risk.
 * The backup contains all encrypted notes + the kms record (wrapped DEK). The user's
 * passphrase is required to unlock the backup on any device.
 */
export async function exportBackup(): Promise<string | null> {
  const path = await save({
    defaultPath: "cove-backup.db",
    filters: [{ name: "SQLite Database", extensions: ["db"] }],
  });
  if (!path) return null;

  await invoke("backup_database", { targetPath: path });
  return path;
}
