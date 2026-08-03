import { create } from "zustand";
import { persist } from "zustand/middleware";
import { blockSuiteEditorService } from "../di/container";
import {
  type CanvasPrefs,
  DEFAULT_CANVAS_PREFS,
} from "../services/blocksuite/IBlockSuiteEditorService";

interface SettingsState {
  autoUnlockOnLaunch: boolean;
  setAutoUnlockOnLaunch: (value: boolean) => void;
  canvasPrefs: CanvasPrefs;
  setCanvasPref: <K extends keyof CanvasPrefs>(key: K, value: CanvasPrefs[K]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoUnlockOnLaunch: false,
      setAutoUnlockOnLaunch: (value) => set({ autoUnlockOnLaunch: value }),
      canvasPrefs: DEFAULT_CANVAS_PREFS,
      setCanvasPref: (key, value) =>
        set((state) => ({ canvasPrefs: { ...state.canvasPrefs, [key]: value } })),
    }),
    {
      name: "cove-settings",
      // Merge persisted canvasPrefs over defaults so newly-added keys keep
      // their default even if an older persisted state is present.
      merge: (persisted, current) => {
        const base = current as SettingsState;
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...base,
          ...p,
          canvasPrefs: { ...DEFAULT_CANVAS_PREFS, ...(p.canvasPrefs ?? {}) },
        };
      },
    },
  ),
);

// Inject the live canvas-feature-flag provider into the editor service. The
// service reads it lazily when opening a doc, so registration order is safe.
blockSuiteEditorService.provideCanvasPrefs(() => useSettingsStore.getState().canvasPrefs);
