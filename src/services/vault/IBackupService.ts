export interface IBackupService {
  exportBackup(): Promise<string | null>;
  pickBackupFile(): Promise<string | null>;
  /** Replaces the live database and restarts the app; only returns on failure. */
  restoreFromFile(path: string): Promise<void>;
}
