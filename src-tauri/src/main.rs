#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::panic;

fn main() {
  tracing_subscriber::fmt::init();

  panic::set_hook(Box::new(|info| {
    eprintln!("Tauri application panic: {:?}", info);
  }));

  let app = tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_keyring::init())
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
