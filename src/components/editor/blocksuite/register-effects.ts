/**
 * BlockSuite v0.27.0 registers custom elements (drag handle, slash menu, edgeless
 * widgets, block components, etc.) via per-package `effects()` functions — NOT
 * via `@customElement` decorators. The extension framework's `effect()` method
 * (which calls `effects()`) is never invoked at runtime. This module brute-force
 * imports and calls ALL `effects()` functions from every package's compiled
 * `dist/effects.js`, ensuring every custom element is registered before the
 * editor mounts.
 *
 * This is the equivalent of what the AFFiNE production app does internally.
 */

// Vite's import.meta.glob with eager: true loads all matching modules
// synchronously at bundle time. The glob targets the AFFiNE repo's compiled
// dist/effects.js files.
const modules = import.meta.glob("../../../../Affine/blocksuite/**/dist/effects.js", {
  eager: true,
}) as Record<string, { effects?: () => void }>;

let registered = 0;
for (const [path, mod] of Object.entries(modules)) {
  if (typeof mod.effects === "function") {
    try {
      mod.effects();
      registered++;
    } catch (err) {
      // Some effects might fail if dependencies aren't ready — log and continue.
      console.warn(`[register-effects] Failed: ${path}`, err);
    }
  }
}

if (registered > 0) {
  // biome-ignore lint/suspicious/noConsole: one-time startup log
  console.log(`[register-effects] Registered ${registered} BlockSuite custom element sets.`);
}
