use sqlx::sqlite::SqliteConnectOptions;
use sqlx::ConnectOptions;
use std::path::{Path, PathBuf};
use tauri::Manager;

/// Export a consistent snapshot of the vault database to a user-chosen path.
///
/// Uses SQLite's `VACUUM INTO` on a fresh read-only connection instead of a
/// raw file copy: the app runs in WAL mode, so committed transactions can live
/// exclusively in cove.db-wal — a plain copy of cove.db would silently miss
/// them (and could tear mid-checkpoint). `VACUUM INTO` reads through the WAL
/// and produces a complete, self-contained database file.
///
/// Note: note *content* in the snapshot is AES-GCM ciphertext, but titles,
/// workspace names, and timestamps are stored (and exported) in plaintext.
#[tauri::command]
pub async fn backup_database(app: tauri::AppHandle, target_path: String) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?;
    let db_path = data_dir.join("cove.db");

    let target = validate_target(&target_path, &data_dir)?;
    if target.exists() {
        // The OS save dialog already asked the user to confirm overwriting;
        // VACUUM INTO refuses to write over an existing file, so clear it here.
        std::fs::remove_file(&target).map_err(|e| format!("Cannot replace backup file: {e}"))?;
    }

    let mut conn = SqliteConnectOptions::new()
        .filename(&db_path)
        .read_only(true)
        .connect()
        .await
        .map_err(|e| format!("Cannot open database for backup: {e}"))?;

    let target_str = target
        .to_str()
        .ok_or("Backup path is not valid UTF-8.")?
        .to_owned();
    sqlx::query("VACUUM INTO ?1")
        .bind(target_str)
        .execute(&mut conn)
        .await
        .map_err(|e| format!("Backup failed: {e}"))?;
    Ok(())
}

/// The renderer supplies the target path (it owns the save dialog), so treat it
/// as untrusted: require an absolute .db path outside the live data directory,
/// which also guards cove.db / cove.db-wal from being clobbered by their own
/// backup.
fn validate_target(raw: &str, data_dir: &Path) -> Result<PathBuf, String> {
    let target = PathBuf::from(raw);
    if !target.is_absolute() {
        return Err("Backup path must be absolute.".into());
    }
    if target.extension().and_then(|e| e.to_str()) != Some("db") {
        return Err("Backup file must have a .db extension.".into());
    }
    let file_name = target
        .file_name()
        .ok_or("Backup path has no file name.")?
        .to_owned();
    let parent = target
        .parent()
        .ok_or("Backup path has no parent directory.")?
        .canonicalize()
        .map_err(|e| format!("Backup directory does not exist: {e}"))?;
    if let Ok(dd) = data_dir.canonicalize() {
        if parent.starts_with(&dd) {
            return Err("Backup cannot be written into the app data directory.".into());
        }
    }
    Ok(parent.join(file_name))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_relative_and_wrong_extension() {
        let data_dir = std::env::temp_dir();
        assert!(validate_target("relative.db", &data_dir).is_err());
        let txt = std::env::temp_dir().join("backup.txt");
        assert!(validate_target(txt.to_str().unwrap(), &data_dir).is_err());
    }

    #[test]
    fn rejects_paths_inside_data_dir() {
        let data_dir = std::env::temp_dir();
        let inside = data_dir.join("cove.db");
        assert!(validate_target(inside.to_str().unwrap(), &data_dir).is_err());
    }

    #[test]
    fn accepts_absolute_db_path_outside_data_dir() {
        let data_dir = std::env::temp_dir().join("cove-nonexistent-data-dir");
        let target = std::env::temp_dir().join("cove-backup-test.db");
        let validated = validate_target(target.to_str().unwrap(), &data_dir).unwrap();
        assert_eq!(validated.file_name().unwrap(), "cove-backup-test.db");
    }
}
