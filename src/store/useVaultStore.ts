import { create } from "zustand";
import { vaultService } from "../di/container";
import type { VaultStatus } from "../services/IVaultService";
import { Logger } from "../services/Logger";
import { useSettingsStore } from "./useSettingsStore";

interface VaultState {
  status: VaultStatus;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setupPassphrase: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  recover: (passphrase: string) => Promise<void>;
  tryAutoUnlock: () => Promise<boolean>;
  lock: () => Promise<void>;
  setTrustDevice: (enabled: boolean) => Promise<void>;
}

const refreshStatus = async (): Promise<VaultStatus> => {
  try {
    return await vaultService.computeStatus();
  } catch {
    return "uninitialized";
  }
};

export const useVaultStore = create<VaultState>((set) => ({
  status: "uninitialized",
  init: async () => {
    const auto = useSettingsStore.getState().autoUnlockOnLaunch;
    if (auto && (await vaultService.tryAutoUnlock())) {
      set({ status: "unlocked" });
    } else {
      set({ status: await refreshStatus() });
    }
  },
  refresh: async () => {
    set({ status: await refreshStatus() });
  },
  setupPassphrase: async (passphrase) => {
    await vaultService.setupPassphrase(passphrase);
    set({ status: await refreshStatus() });
  },
  unlock: async (passphrase) => {
    await vaultService.unlock(passphrase);
    if (useSettingsStore.getState().autoUnlockOnLaunch) {
      try {
        await vaultService.setKeychainEscrow(true);
      } catch (err) {
        Logger.warn("vault: escrow refresh after unlock failed", err);
      }
    }
    set({ status: await refreshStatus() });
  },
  recover: async (passphrase) => {
    await vaultService.recoverViaKeychain(passphrase);
    set({ status: await refreshStatus() });
  },
  tryAutoUnlock: async () => {
    const ok = await vaultService.tryAutoUnlock();
    set({ status: await refreshStatus() });
    return ok;
  },
  lock: async () => {
    await vaultService.lock();
    set({ status: await refreshStatus() });
  },
  setTrustDevice: async (enabled) => {
    await vaultService.setKeychainEscrow(enabled);
    useSettingsStore.getState().setAutoUnlockOnLaunch(enabled);
  },
}));
