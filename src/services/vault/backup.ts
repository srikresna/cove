import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { IBackupService } from "./IBackupService";

const DB_FILTERS = [{ name: "SQLite Database", extensions: ["db"] }];

export class TauriBackupService implements IBackupService {
  constructor(private readonly db: { suspend: () => Promise<void>; resume: () => void }) {}

  async exportBackup(): Promise<string | null> {
    const path = await save({
      defaultPath: "cove-backup.db",
      filters: DB_FILTERS,
    });
    if (!path) return null;

    await invoke("backup_database", { targetPath: path });
    return path;
  }

  async pickBackupFile(): Promise<string | null> {
    const path = await open({ multiple: false, filters: DB_FILTERS });
    return typeof path === "string" ? path : null;
  }

  async restoreFromFile(path: string): Promise<void> {
    // The pool must release cove.db (and stay closed) while the file is swapped.
    await this.db.suspend();
    try {
      await invoke("restore_database", { sourcePath: path });
    } finally {
      // Always release the suspend so the pool can reopen — on success against
      // the swapped file, on error against the original. (The caller still reloads
      // on success because every in-memory store is now stale.)
      this.db.resume();
    }
  }
}
