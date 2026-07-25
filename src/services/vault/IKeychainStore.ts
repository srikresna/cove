/**
 * Abstraction over the OS credential store (Windows Credential Manager /
 * macOS Keychain / Linux Secret Service) via tauri-plugin-keyring.
 *
 * Abstracted behind an interface so unit tests use an in-memory fake and never
 * touch the real OS keychain or the Tauri IPC bridge.
 */
export interface IKeychainStore {
  get(service: string, user: string): Promise<string | null>;
  set(service: string, user: string, value: string): Promise<void>;
  delete(service: string, user: string): Promise<void>;
}

/** Keyring "service" identifier (Tauri app identifier). */
export const KEYRING_SERVICE = "com.cove.notes";

/**
 * Keyring "user" identifiers (distinct entries under the same service).
 *
 * NOTE on the recovery entry: per the project's accepted threat model, the DEK
 * backup stored here is reachable by an OS-session attacker (Windows DPAPI /
 * macOS login keyring / Linux autologin). This is "protect against DB theft,
 * not against a live-session attacker" — documented honestly in the README and
 * the SetPassphrase disclosure. It is NOT zero-knowledge recovery.
 */
export const KEYRING_USERS = {
  /** DEK backup (passphrase-less recovery on the trusted device). */
  dekBackup: "dek-backup",
  /** Transient legacy-key bridge for migration abort/rollback (purged post-migration). */
  legacyBridge: "legacy-dek-bridge",
} as const;
