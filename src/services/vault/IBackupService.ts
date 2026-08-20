export interface IBackupService {
  exportBackup(): Promise<string | null>;
  pickBackupFile(): Promise<string | null>;

  preRestoreBackupPath(): Promise<string | null>;

  rollbackPreRestore(): Promise<boolean>;

  restoreFromFile(path: string): Promise<void>;
}
