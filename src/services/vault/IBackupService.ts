export interface IBackupService {
  exportBackup(): Promise<string | null>;
}
