use sqlx::sqlite::SqliteConnectOptions;
use sqlx::{ConnectOptions, Connection};
use std::path::Path;
use tauri::Manager;

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

    let staged = data_dir.join("cove.db.restore-tmp");
    let stage_src = source.clone();
    let stage_dst = staged.clone();
    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        let _ = std::fs::remove_file(&stage_dst);
        std::fs::copy(&stage_src, &stage_dst).map_err(|e| format!("Cannot stage backup: {e}"))?;
        Ok(())
    })
    .await
    .map_err(|e| format!("Stage task failed: {e}"))??;

    if db_path.exists() {
        let pre = data_dir.join("cove.db.pre-restore");
        let _ = std::fs::remove_file(&pre);
        let copied = crate::backup::vacuum_into(&db_path, &pre).await;
        if copied.is_err() {
            tracing::warn!(target: "cove::restore", "VACUUM INTO safety copy failed; falling back to file copy");
            if let Err(e) = std::fs::copy(&db_path, &pre) {
                let _ = std::fs::remove_file(&staged);
                return Err(format!("Cannot create safety copy: {e}"));
            }
        }
    }

    let swap_staged = staged.clone();
    tauri::async_runtime::spawn_blocking(move || -> Result<(), String> {
        for sidecar in ["cove.db-wal", "cove.db-shm"] {
            let sidecar_path = data_dir.join(sidecar);
            if sidecar_path.exists() {
                if let Err(e) = std::fs::remove_file(&sidecar_path) {
                    let _ = std::fs::remove_file(&swap_staged);
                    return Err(format!("Cannot remove stale {sidecar}: {e}"));
                }
            }
        }
        if let Err(e) = std::fs::rename(&swap_staged, &db_path) {
            let _ = std::fs::remove_file(&swap_staged);
            return Err(format!("Restore failed: {e}"));
        }
        Ok(())
    })
    .await
    .map_err(|e| format!("Swap task failed: {e}"))??;

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
    async fn safety_copy_via_vacuum_captures_wal_resident_rows() {
        let dir = std::env::temp_dir().join(format!("cove-restore-wal-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let db = dir.join("cove.db");
        let copy = dir.join("cove.db.pre-restore");
        let _ = std::fs::remove_file(&db);
        let _ = std::fs::remove_file(&copy);

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
        sqlx::query("INSERT INTO notes VALUES ('n1', 'wal-resident')")
            .execute(&mut writer)
            .await
            .unwrap();

        crate::backup::vacuum_into(&db, &copy).await.unwrap();

        let mut check = SqliteConnectOptions::new()
            .filename(&copy)
            .read_only(true)
            .connect()
            .await
            .unwrap();
        let row: (String,) = sqlx::query_as("SELECT content FROM notes WHERE id = 'n1'")
            .fetch_one(&mut check)
            .await
            .unwrap();
        assert_eq!(row.0, "wal-resident");

        use sqlx::Connection;
        check.close().await.ok();
        writer.close().await.ok();
        let _ = std::fs::remove_dir_all(&dir);
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
