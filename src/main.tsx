import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./di/container";
import "./index.css";
import "./lib/disposableGuard";
import { setupFullscreenShim } from "./lib/fullscreenShim";
import "./store/blockSuiteBridge";
import { queryClient } from "./store/queryClient";

void setupFullscreenShim();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
