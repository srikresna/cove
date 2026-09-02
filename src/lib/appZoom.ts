import { getCurrentWebview } from "@tauri-apps/api/webview";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2.0;
export const ZOOM_STEP = 0.1;

export interface AppZoomAccess {
  /** The persisted zoom factor (clamped on use). */
  getFactor(): number;
  /** Persists a new factor; the caller owns where it lives. */
  setFactor(factor: number): void;
}

const clampZoom = (factor: number): number =>
  Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, factor)) * 100) / 100;

// 1.0 is the webview default — skipping that IPC keeps browser dev servers
// and fresh installs off the permission entirely, while still letting a
// Ctrl+0 reset reach the webview when a non-default zoom is active.
let appliedNonDefault = false;

const applyZoom = async (factor: number): Promise<void> => {
  try {
    if (factor === 1 && !appliedNonDefault) return;
    await getCurrentWebview().setZoom(factor);
    appliedNonDefault = factor !== 1;
  } catch {
    // Not fatal: a denied permission or a plain browser context just means
    // no zoom; the hotkeys keep working as no-ops.
  }
};

/** Restores the persisted zoom before the first React paint and wires
 *  Ctrl+= / Ctrl+- / Ctrl+0 (Cmd on macOS). Persistence is injected so this
 *  module stays free of store imports (the composition root wires it). */
export async function setupAppZoom(access: AppZoomAccess): Promise<void> {
  await applyZoom(clampZoom(access.getFactor()));

  const zoomBy = (delta: number): void => {
    const next = clampZoom(access.getFactor() + delta);
    if (next === access.getFactor()) return;
    access.setFactor(next);
    void applyZoom(next);
  };

  window.addEventListener("keydown", (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    // The vendored edgeless canvas binds Ctrl+=/- to its own zoom and only
    // preventDefaults them — honor that so the two zooms never compound.
    if (e.defaultPrevented) return;
    const key = e.key;
    if (key === "=" || key === "+") {
      e.preventDefault();
      zoomBy(ZOOM_STEP);
    } else if (key === "-") {
      e.preventDefault();
      zoomBy(-ZOOM_STEP);
    } else if (key === "0") {
      e.preventDefault();
      if (access.getFactor() === 1) return;
      access.setFactor(1);
      void applyZoom(1);
    }
  });
}
