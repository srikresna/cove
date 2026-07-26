use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{ConnectOptions, Connection};
use std::path::Path;
use tauri::Manager;

/// Replaces the live database with a backup and restarts the app. The JS side
/// must close its connection pool first, or the file swap fails on Windows.
/// The previous database survives as cove.db.pre-restore.
#[tauri::command]
pub async fn restore_database(app: tauri::AppHandle, source_path: String) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Cannot resolve app config dir: {e}"))?;
    let db_path = data_dir.join("cove.db");

    let source = Path::new(&source_path);
    if !source.is_absolute() {
        return Err("Backup path must be absolute.".into());
    }
    let source = source
        .canonicalize()
        .map_err(|e| format!("Backup file not found: {e}"))?;
    if let Ok(live) = db_path.canonicalize() {
        if source == live {
            return Err("That file is the live database itself.".into());
        }
    }
    validate_backup(&source).await?;

    // Stage into a temp file, then swap with an atomic same-volume rename —
    // a failure at any step leaves the live cove.db untouched (fs::copy onto
    // it directly would truncate in place and corrupt it on a partial write).
    let staged = data_dir.join("cove.db.restore-tmp");
    let _ = std::fs::remove_file(&staged);
    std::fs::copy(&source, &staged).map_err(|e| format!("Cannot stage backup: {e}"))?;
    if db_path.exists() {
        if let Err(e) = std::fs::copy(&db_path, data_dir.join("cove.db.pre-restore")) {
            let _ = std::fs::remove_file(&staged);
            return Err(format!("Cannot create safety copy: {e}"));
        }
    }
    if let Err(e) = std::fs::rename(&staged, &db_path) {
        let _ = std::fs::remove_file(&staged);
        return Err(format!("Restore failed: {e}"));
    }
    // Stale sidecars of the replaced database would corrupt the restored one.
    let _ = std::fs::remove_file(data_dir.join("cove.db-wal"));
    let _ = std::fs::remove_file(data_dir.join("cove.db-shm"));

    app.restart();
}

async fn validate_backup(path: &Path) -> Result<(), String> {
    let mut conn = SqliteConnectOptions::new()
        .filename(path)
        .read_only(true)
        .connect()
        .await
        .map_err(|e| format!("Not a readable SQLite database: {e}"))?;
    let kms: Option<(String,)> =
        sqlx::query_as("SELECT name FROM sqlite_master WHERE type='table' AND name='kms'")
            .fetch_optional(&mut conn)
            .await
            .map_err(|e| format!("Cannot inspect backup: {e}"))?;
    conn.close().await.ok();
    if kms.is_none() {
        return Err("Not a cove backup: the file contains no vault data.".into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqliteJournalMode;

    async fn make_db(path: &Path, with_kms: bool) {
        let mut conn = SqliteConnectOptions::new()
            .filename(path)
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Delete)
            .connect()
            .await
            .unwrap();
        if with_kms {
            sqlx::query("CREATE TABLE kms(id INTEGER PRIMARY KEY)")
                .execute(&mut conn)
                .await
                .unwrap();
        } else {
            sqlx::query("CREATE TABLE other(id INTEGER PRIMARY KEY)")
                .execute(&mut conn)
                .await
                .unwrap();
        }
        conn.close().await.ok();
    }

    #[tokio::test(flavor = "current_thread")]
    async fn accepts_a_backup_with_a_kms_table() {
        let path = std::env::temp_dir().join(format!("cove-restore-ok-{}.db", std::process::id()));
        let _ = std::fs::remove_file(&path);
        make_db(&path, true).await;
        assert!(validate_backup(&path).await.is_ok());
        let _ = std::fs::remove_file(&path);
    }

    #[tokio::test(flavor = "current_thread")]
    async fn rejects_databases_without_vault_data_and_non_databases() {
        let no_kms = std::env::temp_dir().join(format!("cove-restore-no-{}.db", std::process::id()));
        let _ = std::fs::remove_file(&no_kms);
        make_db(&no_kms, false).await;
        assert!(validate_backup(&no_kms).await.is_err());
        let _ = std::fs::remove_file(&no_kms);

        let not_db = std::env::temp_dir().join(format!("cove-restore-txt-{}.db", std::process::id()));
        std::fs::write(&not_db, b"definitely not sqlite").unwrap();
        assert!(validate_backup(&not_db).await.is_err());
        let _ = std::fs::remove_file(&not_db);
    }
}
