import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setGcalClientCredentials } from "../config/gcal";
import { blockSuiteEditorService } from "../di/container";
import { clampZoom } from "../lib/appZoom";
import {
  type CanvasPrefs,
  DEFAULT_CANVAS_PREFS,
} from "../services/blocksuite/IBlockSuiteEditorService";

interface SettingsState {
  autoUnlockOnLaunch: boolean;
  setAutoUnlockOnLaunch: (value: boolean) => void;
  canvasPrefs: CanvasPrefs;
  setCanvasPref: <K extends keyof CanvasPrefs>(key: K, value: CanvasPrefs[K]) => void;
  zoomFactor: number;
  setZoomFactor: (value: number) => void;
  gcalClientId: string;
  setGcalClientId: (value: string) => void;
  gcalClientSecret: string;
  setGcalClientSecret: (value: string) => void;
  gcalShowEvents: boolean;
  setGcalShowEvents: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoUnlockOnLaunch: false,
      setAutoUnlockOnLaunch: (value) => set({ autoUnlockOnLaunch: value }),
      canvasPrefs: DEFAULT_CANVAS_PREFS,
      setCanvasPref: (key, value) =>
        set((state) => ({ canvasPrefs: { ...state.canvasPrefs, [key]: value } })),
      zoomFactor: 1,
      setZoomFactor: (value) => set({ zoomFactor: value }),
      gcalClientId: "",
      setGcalClientId: (gcalClientId) => {
        set({ gcalClientId });
        setGcalClientCredentials(gcalClientId, useSettingsStore.getState().gcalClientSecret);
      },
      gcalClientSecret: "",
      setGcalClientSecret: (gcalClientSecret) => {
        set({ gcalClientSecret });
        setGcalClientCredentials(useSettingsStore.getState().gcalClientId, gcalClientSecret);
      },
      gcalShowEvents: true,
      setGcalShowEvents: (gcalShowEvents) => set({ gcalShowEvents }),
    }),
    {
      name: "cove-settings",

      merge: (persisted, current) => {
        const base = current as SettingsState;
        const p = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...base,
          ...p,
          zoomFactor:
            typeof p.zoomFactor === "number" && Number.isFinite(p.zoomFactor)
              ? clampZoom(p.zoomFactor)
              : 1,
          canvasPrefs: { ...DEFAULT_CANVAS_PREFS, ...(p.canvasPrefs ?? {}) },
          gcalClientId: typeof p.gcalClientId === "string" ? p.gcalClientId : base.gcalClientId,
          gcalClientSecret:
            typeof p.gcalClientSecret === "string" ? p.gcalClientSecret : base.gcalClientSecret,
          gcalShowEvents: p.gcalShowEvents !== false,
        };
      },
    },
  ),
);

{
  const { gcalClientId, gcalClientSecret } = useSettingsStore.getState();
  setGcalClientCredentials(gcalClientId, gcalClientSecret);
}

blockSuiteEditorService.provideCanvasPrefs(() => useSettingsStore.getState().canvasPrefs);
