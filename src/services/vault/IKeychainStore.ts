/**
 * Abstraction over the OS credential store (Windows Credential Manager /
 * macOS Keychain / Linux Secret Service).
 *
 * Backed by scoped Rust commands that hard-code the keyring service name and
 * allowlist the entry names — the webview can only ever touch cove's own
 * entries, never other applications' credentials. Abstracted behind an
 * interface so unit tests use an in-memory fake and never touch the real OS
 * keychain or the Tauri IPC bridge.
 */
export interface IKeychainStore {
  get(user: string): Promise<string | null>;
  set(user: string, value: string): Promise<void>;
  delete(user: string): Promise<void>;
}

/**
 * Keyring "user" identifiers (distinct entries under the app's service name,
 * which lives in src-tauri/src/keychain.rs). Must match ALLOWED_USERS there.
 *
 * NOTE on the recovery entry: per the project's accepted threat model, the DEK
 * backup stored here is reachable by an OS-session attacker (Windows DPAPI /
 * macOS login keyring / Linux autologin). This is "protect against DB theft,
 * not against a live-session attacker" — documented honestly in the README and
 * the SetPassphrase disclosure. It is NOT zero-knowledge recovery. The entry
 * only exists while "Trust this device" is enabled.
 */
export const KEYRING_USERS = {
  /** DEK backup (passphrase-less recovery on the trusted device; opt-in). */
  dekBackup: "dek-backup",
  /** Transient old-key bridge so an interrupted migration/rotation can resume (purged when done). */
  legacyBridge: "legacy-dek-bridge",
} as const;
