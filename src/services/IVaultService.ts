export type VaultStatus = "uninitialized" | "locked" | "unlocked";

export interface IVaultService {
  computeStatus(): Promise<VaultStatus>;
  isUnlocked(): boolean;
  setupPassphrase(passphrase: string): Promise<void>;
  unlock(passphrase: string): Promise<void>;
  lock(): Promise<void>;
  onLock(listener: () => void): void;
  tryAutoUnlock(): Promise<boolean>;
  changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<void>;
  setKeychainEscrow(enabled: boolean): Promise<void>;
  recoverViaKeychain(newPassphrase: string): Promise<void>;
}
