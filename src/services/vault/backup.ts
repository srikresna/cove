import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import type { IBackupService } from "./IBackupService";

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
