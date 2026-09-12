#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod backup;
mod crypto;
mod dpapi;
mod keychain;
mod link_preview;
mod restore;
mod transaction;

use std::panic;
use tauri::Manager;

#[tauri::command]
fn js_log(level: String, msg: String) {
  match level.as_str() {
    "warn" => tracing::warn!(target: "cove::js", "{}", msg),
    _ => tracing::error!(target: "cove::js", "{}", msg),
  }
}

/// Writes export bytes to a user-chosen path (the frontend shows the native
/// save dialog first; the transformers themselves can only produce blobs).
#[tauri::command]
fn save_exported_file(path: String, bytes: Vec<u8>) -> Result<(), String> {
  std::fs::write(&path, &bytes).map_err(|e| format!("failed to write {path}: {e}"))
}

fn main() {
  tracing_subscriber::fmt::init();

  panic::set_hook(Box::new(|info| {
    eprintln!("Tauri application panic: {:?}", info);
  }));

  let app = tauri::Builder::default()
    .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
      if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_focus();
      }
    }))
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
        dpapi::device_wrap,
        dpapi::device_unwrap,
        crypto::derive_key_kdf,
        keychain::keychain_get,
        keychain::keychain_set,
        keychain::keychain_delete,
        backup::backup_database,
        backup::pre_restore_backup_path,
        restore::restore_database,
        transaction::run_sql_transaction,
        save_exported_file,
        js_log,
        link_preview::fetch_link_preview
    ])
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|_app_handle, event| match event {
    tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit => {
      tracing::info!(target: "cove::lifecycle", "tauri exit requested");
    }
    _ => {}
  });
}
