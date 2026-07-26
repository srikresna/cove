import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import type { IBackupService } from "./IBackupService";

/**
 * Export a snapshot of the vault database to a user-chosen path.
 *
 * The Rust command produces a WAL-consistent snapshot via SQLite's VACUUM INTO
 * (a plain file copy would silently miss transactions still living in the WAL)
 * and validates the target path.
 *
 * What the backup contains: note CONTENT is AES-GCM ciphertext plus the kms
 * record (wrapped DEK) — the passphrase is required to read it. Note titles,
 * workspace names, icons, and timestamps are stored in plaintext and are
 * therefore readable from the backup file without the passphrase.
 */
export class TauriBackupService implements IBackupService {
  async exportBackup(): Promise<string | null> {
    const path = await save({
      defaultPath: "cove-backup.db",
      filters: [{ name: "SQLite Database", extensions: ["db"] }],
    });
    if (!path) return null;

    await invoke("backup_database", { targetPath: path });
    return path;
  }
}
