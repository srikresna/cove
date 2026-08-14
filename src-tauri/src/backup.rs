use sqlx::sqlite::SqliteConnectOptions;
use sqlx::ConnectOptions;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[tauri::command]
pub async fn backup_database(app: tauri::AppHandle, target_path: String) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Cannot resolve app config dir: {e}"))?;
    let db_path = data_dir.join("cove.db");
    if !db_path.exists() {
        return Err("Database not found; nothing to back up yet.".into());
    }

    let target = validate_target(&target_path, &data_dir)?;
    if target.exists() {
        std::fs::remove_file(&target).map_err(|e| format!("Cannot replace backup file: {e}"))?;
    }
    run_vacuum_into(&db_path, &target).await
}

async fn run_vacuum_into(db_path: &Path, target: &Path) -> Result<(), String> {
    let mut conn = SqliteConnectOptions::new()
        .filename(db_path)
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
    let dd = data_dir
        .canonicalize()
        .map_err(|e| format!("Cannot resolve the app data directory: {e}"))?;
    if parent.starts_with(&dd) {
        return Err("Backup cannot be written into the app data directory.".into());
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
        let data_dir = std::env::temp_dir().join("cove-validate-data-dir");
        std::fs::create_dir_all(&data_dir).unwrap();
        let target = std::env::temp_dir().join("cove-backup-test.db");
        let validated = validate_target(target.to_str().unwrap(), &data_dir).unwrap();
        assert_eq!(validated.file_name().unwrap(), "cove-backup-test.db");
    }

    #[test]
    fn missing_data_dir_is_a_hard_error_not_a_skipped_guard() {
        let data_dir = std::env::temp_dir().join("cove-nonexistent-data-dir");
        let target = std::env::temp_dir().join("cove-backup-test.db");
        assert!(validate_target(target.to_str().unwrap(), &data_dir).is_err());
    }

    #[tokio::test(flavor = "current_thread")]
    async fn vacuum_into_captures_wal_resident_rows() {
        use sqlx::sqlite::SqliteJournalMode;

        let dir = std::env::temp_dir().join(format!("cove-wal-backup-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let db = dir.join("cove.db");
        let target = dir.join("backup.db");
        let _ = std::fs::remove_file(&db);
        let _ = std::fs::remove_file(&target);

        let mut writer = SqliteConnectOptions::new()
            .filename(&db)
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .connect()
            .await
            .unwrap();
        sqlx::query("CREATE TABLE notes(id TEXT PRIMARY KEY, content TEXT)")
            .execute(&mut writer)
            .await
            .unwrap();
        sqlx::query("INSERT INTO notes VALUES ('n1', 'wal-resident-content')")
            .execute(&mut writer)
            .await
            .unwrap();
        assert!(dir.join("cove.db-wal").exists(), "test setup: WAL sidecar expected");

        run_vacuum_into(&db, &target).await.unwrap();

        let mut check = SqliteConnectOptions::new()
            .filename(&target)
            .read_only(true)
            .connect()
            .await
            .unwrap();
        let row: (String,) = sqlx::query_as("SELECT content FROM notes WHERE id = 'n1'")
            .fetch_one(&mut check)
            .await
            .unwrap();
        assert_eq!(row.0, "wal-resident-content");

        use sqlx::Connection;
        check.close().await.ok();
        writer.close().await.ok();
        let _ = std::fs::remove_dir_all(&dir);
    }
}
