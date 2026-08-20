import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/di/container", () => ({
  blockSuiteEditorService: {
    provideCanvasPrefs: () => {},
  },
}));

import { DEFAULT_CANVAS_PREFS } from "@/services/blocksuite/IBlockSuiteEditorService";
import { useSettingsStore } from "@/store/useSettingsStore";

describe("useSettingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      autoUnlockOnLaunch: false,
      canvasPrefs: { ...DEFAULT_CANVAS_PREFS },
    });
  });

  it("starts with canvas defaults", () => {
    expect(useSettingsStore.getState().canvasPrefs).toEqual(DEFAULT_CANVAS_PREFS);
  });

  it("setAutoUnlockOnLaunch updates the flag and persists it", () => {
    useSettingsStore.getState().setAutoUnlockOnLaunch(true);

    expect(useSettingsStore.getState().autoUnlockOnLaunch).toBe(true);
    expect(localStorage.getItem("cove-settings")).toContain("autoUnlockOnLaunch");
  });

  it("setCanvasPref merges a single key without dropping the others", () => {
    useSettingsStore.getState().setCanvasPref("turboRenderer", true);

    const prefs = useSettingsStore.getState().canvasPrefs;
    expect(prefs.turboRenderer).toBe(true);
    expect(prefs.scribbledStyle).toBe(DEFAULT_CANVAS_PREFS.scribbledStyle);
    expect(prefs.shapeShadowBlur).toBe(DEFAULT_CANVAS_PREFS.shapeShadowBlur);
    expect(prefs.domRenderer).toBe(DEFAULT_CANVAS_PREFS.domRenderer);
  });
});

describe("useSettingsStore persisted merge", () => {
  it("rehydrates partial persisted prefs over the defaults", async () => {
    localStorage.setItem(
      "cove-settings",
      JSON.stringify({
        state: { autoUnlockOnLaunch: true, canvasPrefs: { turboRenderer: true } },
        version: 0,
      }),
    );
    vi.resetModules();

    const { useSettingsStore: fresh } = await import("@/store/useSettingsStore");

    const state = fresh.getState();
    expect(state.autoUnlockOnLaunch).toBe(true);
    expect(state.canvasPrefs.turboRenderer).toBe(true);
    expect(state.canvasPrefs.domRenderer).toBe(DEFAULT_CANVAS_PREFS.domRenderer);
  });
});
