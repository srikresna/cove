/**
 * Vault database export. A port like every other IPC touchpoint (keychain,
 * device-bind, KDF) so UI code depends on an interface, not on Tauri.
 */
export interface IBackupService {
  /**
   * Prompt for a destination and export a consistent snapshot of the database.
   * Returns the chosen path, or null if the user cancelled the dialog.
   */
  exportBackup(): Promise<string | null>;
}
