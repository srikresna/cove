export const SettingsMessages = {
  SETTINGS_TITLE: "Settings",
  SETTINGS_CLOSE: "Close settings",
  SETTINGS_DARK_MODE_LABEL: "Dark mode",
  SETTINGS_DARK_MODE_DESC: "Deep-tide theme for low-light writing.",
  SETTINGS_AUTO_UNLOCK_LABEL: "Trust this device",
  SETTINGS_AUTO_UNLOCK_DESC:
    'Keeps a device-bound copy of the vault key in the OS keychain: the app auto-unlocks on launch and "forgot passphrase" recovery works on this device. Anyone with access to this computer\'s login can bypass the passphrase while this is on. Turning it off deletes the keychain copy.',
  SETTINGS_LOCK_NOW: "Lock vault now",
  SETTINGS_CHANGE_PASSPHRASE: "Change passphrase",
  CHANGE_PASS_TITLE: "Change Passphrase",
  CHANGE_PASS_DESC:
    "Your notes stay encrypted with the same key; only the passphrase that unlocks them changes.",
  CHANGE_PASS_BUTTON: "Change Passphrase",
  CHANGE_PASS_SUCCESS_TITLE: "Passphrase changed",
  SETTINGS_EXPORT_BACKUP: "Export Backup",
  SETTINGS_EXPORT_IN_PROGRESS: "Exporting…",
  SETTINGS_EXPORT_BACKUP_HINT:
    "Note content in the backup is encrypted (passphrase required to read it); titles, workspace names, and timestamps are not.",
  BACKUP_SAVED_TITLE: "Backup saved",
  SETTINGS_RESTORE_BACKUP: "Restore Backup",
  SETTINGS_RESTORE_IN_PROGRESS: "Restoring…",
  SETTINGS_RESTORE_BACKUP_HINT:
    "Replaces all current data with a backup file. The app restarts afterwards.",
  RESTORE_CONFIRM_TITLE: "Restore this backup?",
  RESTORE_CONFIRM_DESC:
    "All current notes and workspaces will be replaced by the backup. The current database is kept next to it as cove.db.pre-restore. The app will restart, locked with the backup's passphrase.",
  RESTORE_CONFIRM_BUTTON: "Restore & Restart",
  SETTINGS_CATEGORY_APPEARANCE: "Appearance",
  SETTINGS_CATEGORY_EDITOR: "Editor",
  SETTINGS_CATEGORY_SECURITY: "Security",
  SETTINGS_CATEGORY_BACKUP: "Backup",
  SETTINGS_CATEGORY_ABOUT: "About",
  SETTINGS_EDITOR_HINT: "Changes apply the next time you open a note.",
  SETTINGS_SHORTCUT_HINT: "to open settings",
  SETTINGS_LOCK_NOW_DESC:
    "Locks the vault; your passphrase is required to unlock again — even on a trusted device.",
  SETTINGS_ABOUT_DESC:
    "Cove Notes is a joyful desktop note-taking app with block-based editing, multi-workspace support, and client-side encryption.",
  SETTINGS_ABOUT_VERSION_LABEL: "Version",
  SETTINGS_ABOUT_IDENTIFIER_LABEL: "Identifier",
  SETTINGS_ROLLBACK_LABEL: "Rollback to before the last restore",
  SETTINGS_ROLLBACK_DESC:
    "Puts back the database that was active before the last restore (cove.db.pre-restore). Only appears after a restore.",
  SETTINGS_ROLLBACK_BUTTON: "Rollback",
  SETTINGS_ROLLBACK_IN_PROGRESS: "Rolling back…",
  SETTINGS_ROLLBACK_CONFIRM_TITLE: "Rollback to before the last restore?",
  SETTINGS_ROLLBACK_CONFIRM_DESC:
    "The current database replaces cove.db.pre-restore, so this step is one-way — you cannot come back to the current state afterwards. The app will restart, locked with the previous passphrase.",
} as const;
