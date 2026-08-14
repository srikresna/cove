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
      return Promise.resolve();
    }
  };
}
