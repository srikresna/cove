export const VaultMessages = {
  VAULT_INITIALIZING: "Loading vault…",
  VAULT_UNLOCK_TITLE: "Unlock Cove Notes",
  VAULT_UNLOCK_DESC: "Enter your passphrase to decrypt your notes.",
  VAULT_PASSPHRASE_LABEL: "Passphrase",
  VAULT_PASSPHRASE_PLACEHOLDER: "Enter passphrase",
  VAULT_CONFIRM_LABEL: "Confirm passphrase",
  VAULT_UNLOCK_BUTTON: "Unlock",
  VAULT_UNLOCK_ERROR: "Wrong passphrase. Try again.",
  VAULT_RECOVER_LINK: "Forgot passphrase?",
  VAULT_RECOVER_TITLE: "Recover via keychain",
  VAULT_RECOVER_DESC:
    "Set a new passphrase. Your notes will be recovered from this device's OS keychain backup.",
  VAULT_SET_TITLE: "Set a Passphrase",
  VAULT_SET_DESC:
    'Choose a strong passphrase to encrypt your notes. It is not stored anywhere — if you forget it, recovery is only possible on this device, and only if "Trust this device" is enabled in Settings.',
  VAULT_SET_BUTTON: "Create Vault",
  VAULT_SET_MISMATCH: "Passphrases do not match.",
  VAULT_DISCLOSURE:
    'Note content and cover images are encrypted with AES-256-GCM. The key is derived from your passphrase (Argon2id, memory-hard) and held in memory only while unlocked. Titles, workspace names, tags, and timestamps are stored unencrypted so notes can be listed and searched without unlocking — anyone with the database file can read them. Enabling "Trust this device" in Settings keeps a device-bound recovery copy in your OS keychain (trusted-device recovery, not zero-knowledge).',
  VAULT_CURRENT_PASSPHRASE_LABEL: "Current passphrase",
  VAULT_NEW_PASSPHRASE_LABEL: "New passphrase",
} as const;
