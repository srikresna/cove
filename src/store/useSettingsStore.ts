import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  autoUnlockOnLaunch: boolean;
  setAutoUnlockOnLaunch: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoUnlockOnLaunch: false,
      setAutoUnlockOnLaunch: (value) => set({ autoUnlockOnLaunch: value }),
    }),
    { name: "cove-settings" },
  ),
);
