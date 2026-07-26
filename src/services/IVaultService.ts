export type VaultStatus = "uninitialized" | "locked" | "unlocked";

export interface IVaultService {
  computeStatus(): Promise<VaultStatus>;
  isUnlocked(): boolean;
  setupPassphrase(passphrase: string): Promise<void>;
  unlock(passphrase: string): Promise<void>;
  lock(): Promise<void>;
  /**
   * Register a callback that fires on every lock, regardless of who initiated
   * it — so security invariants (e.g. purging decrypted plaintext from UI
   * stores) cannot be bypassed by calling lock() directly.
   */
  onLock(listener: () => void): void;
  /** Trusted-device auto-unlock: install the DEK from the OS keychain backup, no passphrase. */
  tryAutoUnlock(): Promise<boolean>;
  changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<void>;
  /**
   * "Trust this device": when enabled, a device-bound wrap of the DEK is kept
   * in the OS keychain (enables auto-unlock and forgot-passphrase recovery on
   * this device — anyone in this OS session can bypass the passphrase). When
   * disabled, the keychain entry is deleted. Requires an unlocked vault to enable.
   */
  setKeychainEscrow(enabled: boolean): Promise<void>;
  /** Recovery when the passphrase is forgotten: read the DEK backup from the OS keychain (trusted device). */
  recoverViaKeychain(newPassphrase: string): Promise<void>;
}
