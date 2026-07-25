export type VaultStatus = "uninitialized" | "locked" | "unlocked" | "migration_in_progress";

export interface IVaultService {
  computeStatus(): Promise<VaultStatus>;
  isUnlocked(): boolean;
  setupPassphrase(passphrase: string): Promise<void>;
  unlock(passphrase: string): Promise<void>;
  lock(): Promise<void>;
  changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<void>;
  /** Recovery when the passphrase is forgotten: read the DEK backup from the OS keychain (trusted device). */
  recoverViaKeychain(newPassphrase: string): Promise<void>;
}
