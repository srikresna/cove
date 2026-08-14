export interface IBackupService {
  exportBackup(): Promise<string | null>;
  pickBackupFile(): Promise<string | null>;

  restoreFromFile(path: string): Promise<void>;
}
