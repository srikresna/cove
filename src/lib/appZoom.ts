import { getCurrentWebview } from "@tauri-apps/api/webview";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2.0;
export const ZOOM_STEP = 0.1;

const WHEEL_SENSITIVITY = 0.0015;
const WHEEL_DELTA_CAP = 120;

export interface AppZoomAccess {
  getFactor(): number;
  setFactor(factor: number): void;
}

export const clampZoom = (factor: number): number =>
  Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, factor)) * 100) / 100;

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
      lastSent = prev;
    }
  });
  return sendChain;
};

export async function applyZoomFactor(factor: number): Promise<void> {
  await applyZoom(clampZoom(factor));
}

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
      residual = raw / current;
      return;
    }
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
