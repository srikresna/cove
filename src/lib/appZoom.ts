import { getCurrentWebview } from "@tauri-apps/api/webview";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2.0;
export const ZOOM_STEP = 0.1;

// Wheel sensitivity: a ~100-unit pixel delta (one mouse notch) maps to a
// ~15% multiplicative step; the per-event cap keeps free-wheel flicks from
// jumping more than ~20% at a time.
const WHEEL_SENSITIVITY = 0.0015;
const WHEEL_DELTA_CAP = 120;

export interface AppZoomAccess {
  /** The persisted zoom factor (clamped on use). */
  getFactor(): number;
  /** Persists a new factor; the caller owns where it lives. */
  setFactor(factor: number): void;
}

/** Clamps a zoom factor to the supported range at 2-decimal precision. */
export const clampZoom = (factor: number): number =>
  Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, factor)) * 100) / 100;

// The webview zoom defaults to 1. Skipping no-op IPC keeps browser dev
// servers and fresh installs off the permission. Sends are chained so
// concurrent invokes execute in call order (Tauri promises none), and a
// failed send restores the previous value so a later zoom-to-the-same-
// factor is never skipped against state the webview never reached.
let lastSent = 1;
let sendChain: Promise<void> = Promise.resolve();

const applyZoom = (factor: number): Promise<void> => {
  if (factor === lastSent) return Promise.resolve();
  const prev = lastSent;
  lastSent = factor;
  sendChain = sendChain.then(async () => {
    try {
      await getCurrentWebview().setZoom(factor);
    } catch {
      // Not fatal (denied permission / plain browser context); roll back
      // to the last known-good assumption.
      lastSent = prev;
    }
  });
  return sendChain;
};

/** Applies a zoom factor (clamped) to the webview immediately — used by the
 *  settings UI, which persists the factor itself. */
export async function applyZoomFactor(factor: number): Promise<void> {
  await applyZoom(clampZoom(factor));
}

/** Restores the persisted zoom before the first React paint and wires
 *  Ctrl+= / Ctrl+- / Ctrl+0 (Cmd on macOS) plus Ctrl+wheel / pinch.
 *  Persistence is injected so this module stays free of store imports (the
 *  composition root wires it). */
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

  // Ctrl+wheel (and trackpad pinch, which browsers report the same way)
  // zooms the app — except over the edgeless canvas, which owns the
  // gesture. The canvas handler preventDefaults when its dispatcher is
  // active, but the dispatcher deactivates while focus sits in an outside
  // input, so also skip by pointer position. Deltas scale the factor
  // multiplicatively, one commit per animation frame; sub-threshold frames
  // (whose product rounds back to the current 2-decimal factor) carry
  // their residual forward so gentle pinches still accumulate.
  let pendingScale = 1;
  let residual = 1;
  let frameId: number | null = null;
  const flushWheelZoom = () => {
    frameId = null;
    const current = access.getFactor();
    const raw = current * residual * pendingScale;
    pendingScale = 1;
    const next = clampZoom(raw);
    if (next === current) {
      // Quantization dropped this frame's movement — keep the fraction.
      residual = raw / current;
      return;
    }
    // At a clamp boundary the gesture is exhausted; nothing to carry.
    residual = next <= ZOOM_MIN || next >= ZOOM_MAX ? 1 : raw / next;
    access.setFactor(next);
    void applyZoom(next);
  };

  window.addEventListener(
    "wheel",
    (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.defaultPrevented) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("affine-edgeless-root")) return;
      e.preventDefault();
      const dy = Math.max(-WHEEL_DELTA_CAP, Math.min(WHEEL_DELTA_CAP, e.deltaY));
      pendingScale *= Math.exp(-dy * WHEEL_SENSITIVITY);
      if (frameId === null) frameId = requestAnimationFrame(flushWheelZoom);
    },
    { passive: false },
  );
}
