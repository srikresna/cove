import { QueryClientProvider } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./di/container";
import "./index.css";
import { setupAppZoom } from "./lib/appZoom";
import "./lib/disposableGuard";
import { setupFullscreenShim } from "./lib/fullscreenShim";
import { useSettingsStore } from "./store/useSettingsStore";
import "./store/blockSuiteBridge";
import { queryClient } from "./store/queryClient";

// A blank window means a script died silently — surface every error and
// rejection into the Rust log so release builds stay diagnosable.
window.addEventListener("error", (e) => {
  void invoke("js_log", {
    level: "error",
    msg: `${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`,
  });
});
window.addEventListener("unhandledrejection", (e) => {
  void invoke("js_log", {
    level: "error",
    msg: `unhandled rejection: ${String(e.reason)}`,
  });
});

void setupFullscreenShim();

// Apply the persisted zoom before the first React paint so the UI never
// flashes at the wrong scale; #root is empty until the render below.
void setupAppZoom({
  getFactor: () => useSettingsStore.getState().zoomFactor,
  setFactor: (factor) => useSettingsStore.getState().setZoomFactor(factor),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
