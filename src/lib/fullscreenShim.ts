/**
 * Makes `element.requestFullscreen()` safe for the presentation flow.
 *
 * BlockSuite's presentation toolbar calls it from an async Lit callback, after
 * the user-gesture window has closed — native `requestFullscreen` then throws
 * "API can only be initiated by a user gesture" synchronously. That throw is
 * noisy even though it is caught upstream.
 *
 * This wrapper tries the native API (which still works for genuine user-gesture
 * callers, e.g. Cove's editor fullscreen toggle) and swallows the gesture
 * failure for the async presentation caller. The actual presentation
 * "fullscreen" is produced elsewhere — BlockSuiteSurface watches the edgeless
 * tool controller and CSS-fullscreens the editor when the frameNavigator tool
 * is active.
 */
export async function setupFullscreenShim(): Promise<void> {
  const nativeRequestFullscreen = Element.prototype.requestFullscreen;

  Element.prototype.requestFullscreen = function requestFullscreen(
    this: Element,
    options?: FullscreenOptions,
  ): Promise<void> {
    try {
      const result = nativeRequestFullscreen.call(this, options);
      if (result && typeof result.catch === "function") {
        return result.catch(() => undefined);
      }
      return result ?? Promise.resolve();
    } catch {
      // No user-gesture context (presentation's async path) — swallow; the
      // CSS presentation fullscreen in BlockSuiteSurface handles the visual.
      return Promise.resolve();
    }
  };
}
