import { create } from "zustand";
import { vaultService } from "../di/container";
import type { VaultStatus } from "../services/IVaultService";

interface VaultState {
  status: VaultStatus;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setupPassphrase: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  lock: () => Promise<void>;
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
    set({ status: await refreshStatus() });
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
    set({ status: await refreshStatus() });
  },
  lock: async () => {
    await vaultService.lock();
    set({ status: await refreshStatus() });
  },
}));
