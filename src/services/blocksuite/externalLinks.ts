import { openUrl } from "@tauri-apps/plugin-opener";

function openExternal(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
  } catch {
    return;
  }
  void openUrl(url).catch(() => {});
}

(globalThis as { __coveOpenExternal?: (url: string) => void }).__coveOpenExternal = openExternal;
