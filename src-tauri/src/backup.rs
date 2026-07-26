use tauri::Manager;

/// Encrypted backup: copies the SQLite database file to a user-chosen path.
/// Runs in Rust so the path never touches SQL string interpolation (no injection).
#[tauri::command]
pub fn backup_database(
    app: tauri::AppHandle,
    target_path: String,
) -> Result<(), String> {
    let data_dir = app
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {}", e))?;
    let db_path = data_dir.join("cove.db");
    std::fs::copy(&db_path, &target_path)
        .map_err(|e| format!("Backup copy failed: {}", e))?;
    Ok(())
}
