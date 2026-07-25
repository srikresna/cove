import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Non-secret app preferences (persisted to localStorage). These are UI/UX
 * preferences, not data — distinct from the encrypted note store.
 */
interface SettingsState {
  /** Trust this device: auto-unlock from the OS keychain on launch (no passphrase
   * prompt). Runtime gate becomes the OS session; notes stay encrypted at rest. */
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
