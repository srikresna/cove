import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./di/container";
import "./index.css";
import "./lib/disposableGuard";
import { setupFullscreenShim } from "./lib/fullscreenShim";

// Route browser fullscreen through Tauri so BlockSuite's presentation toolbar
// (which calls requestFullscreen outside a user-gesture window) works.
void setupFullscreenShim();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
