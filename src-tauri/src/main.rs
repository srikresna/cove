#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod backup;
mod crypto;
mod dpapi;
mod keychain;

use std::panic;
use tauri::Manager;

fn main() {
  tracing_subscriber::fmt::init();

  panic::set_hook(Box::new(|info| {
    eprintln!("Tauri application panic: {:?}", info);
  }));

  let app = tauri::Builder::default()
    // Must be the first plugin. A second process on the same DB would load the
    // same AES-GCM IV counter into memory and could re-emit IVs under the same
    // DEK (nonce reuse) — so a second launch focuses the existing window instead.
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
        backup::backup_database
    ])
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  // Defense-in-depth telemetry: log unclean exits (process kill / crash / power loss).
  // The JS-side VaultService.lock() is the real DEK teardown; this fires even when
  // the renderer is already gone (it cannot null JS fields, only log).
  app.run(|_app_handle, event| match event {
    tauri::RunEvent::ExitRequested { .. } | tauri::RunEvent::Exit => {
      tracing::info!(target: "cove::lifecycle", "tauri exit requested");
    }
    _ => {}
  });
}
